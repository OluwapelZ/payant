const { listServiceProductsAPI, payantServiceApiCall, payantIdentityApiCall, getTransactionStatus, sendOTP } = require('../utils/third_party_api_call');
const { generateRandomReference, generateOTP, hashPhoneNumber } = require('../utils/util');
const {
    mapServiceProducts,
    mapTransactionDetails,
    mapAirtimeResponse,
    mapDataResponse,
    mapElectricityResponse,
    mapMidNinResponse,
    mapMinNinResponse,
    mapScratchCardResponse,
    mapTvResponse
} = require('../utils/mapper');
const {
    InvalidRequestModeError, BillerProductError, ServiceProductCategoryError, BillerNotSupportedError,
    ServiceNotImplementedError, InvalidParamsError, ProviderResponseError, CustomerVerificationError,
    InvalidOtpError, AutheticationError
} = require('../error');
const { authUser } = require('../middleware/auth');
const CONSTANTS = require('../constants/constant');
const ResponseMessages = require('../constants/response_messages');
const config = require('../config/config');
const Transaction = require('../models/transaction');
const { decryptData } = require('../utils/crypt');
const logger = require('../utils/logger');

class BaseService {
    async  queryTransaction(request) {
        const requestPayload = decryptData(request);
        const serviceResponse = null;
        const transaction = null;

        if (!CONSTANTS.AVAILABLE_SERVICES.includes(requestPayload.request_type)) {
        logger.error(`Query request was made to a service ${requestPayload.request_type} currently not implemented`);
        throw new ServiceNotImplementedError(`Service ${requestPayload.request_type} is currently not implemented`);
        }

        if (!requestPayload.transaction || !requestPayload.transaction.transaction_ref) {
        logger.error('Transaction reference is required for query requests');
        throw new InvalidRequestModeError('Transaction reference is required for query requests');
        }

        switch(requestPayload.request_type) {
            case CONSTANTS.REQUEST_TYPES.BUY_AIRTIME:
                transaction = await new Transaction().fetchTransactionByReference(requestPayload.transaction.transaction_ref);
                serviceResponse = this.queryTransactionBuilder(requestPayload, transaction);
                break;
            case CONSTANTS.REQUEST_TYPES.BUY_DATA:
                transaction = await new Transaction().fetchTransactionByReference(requestPayload.transaction.transaction_ref);
                serviceResponse = this.queryTransactionBuilder(requestPayload, transaction);
                break;
            case CONSTANTS.REQUEST_TYPES.PAY_TV:
                transaction = await new Transaction().fetchTransactionByReference(requestPayload.transaction.transaction_ref);
                serviceResponse = this.queryTransactionBuilder(requestPayload, transaction);
                break;
            case CONSTANTS.REQUEST_TYPES.PAY_ELECTRICITY:
                transaction = await new Transaction().fetchTransactionByReference(requestPayload.transaction.transaction_ref);
                serviceResponse = this.queryTransactionBuilder(requestPayload, transaction);
                break;
            case CONSTANTS.REQUEST_TYPES.BUY_SCRATCH_CARD:
                transaction = await new Transaction().fetchTransactionByReference(requestPayload.transaction.transaction_ref);
                serviceResponse = this.queryTransactionBuilder(requestPayload, transaction);
                break;
            case CONSTANTS.REQUEST_TYPES.NIN_MIN:
                transaction = await new Transaction().fetchTransactionByReference(requestPayload.transaction.transaction_ref);
                serviceResponse = this.queryTransactionBuilder(requestPayload, transaction);
                break;
            case CONSTANTS.REQUEST_TYPES.NIN_MID:
                transaction = await new Transaction().fetchTransactionByReference(requestPayload.transaction.transaction_ref);
                serviceResponse = this.queryTransactionBuilder(requestPayload, transaction);
                break;
            default:
                serviceResponse = null;  
        }

        return serviceResponse;
    }

    async listProviderServices(requestPayload) {
        const request = requestPayload.data;
        if (request.auth.route_mode != CONSTANTS.REQUEST_TYPES.OPTIONS) {
            logger.error('Request mode has to be passed as options to make an option call');
            throw new InvalidRequestModeError('Request mode has to be passed as options to make an option call');
        }

        if (!request.transaction.details || !request.transaction.details.biller_id) {
            logger.error('Product biller id has to be passed in the details object [nested in transaction object]');
            throw new BillerProductError('Product biller id has to be passed in details object [nested in transaction object]');
        }

        const billerId = config.service_biller_ids[`${request.request_type}`][`${request.transaction.details.biller_id}`];

        if (!billerId) {
            logger.error(`Provider does not support "${request.transaction.details.biller_id}" biller`);
            throw new BillerNotSupportedError(`Provider does not support "${request.transaction.details.biller_id}" biller`);
        }

        if (['pay_tv', 'pay_electricity'].includes(request.request_type)) { //verify customer's unique number with biller
            if (!request.transaction.customer.customer_ref) {
                logger.error(`Missing parameter customer_ref for service "${request.request_type}"`);
                throw new CustomerVerificationError(`Missing parameter customer_ref for service "${request.request_type}"`);
            }

            const verifyCustomer = await payantServiceApiCall(requestPayload.token, `${CONSTANTS.URL_PATHS.list_services_products}/${billerId}/verify`, { account: request.transaction.customer.customer_ref });
            if (verifyCustomer.status != CONSTANTS.PAYANT_STATUS_TYPES.successful) {
                logger.error(`Customer unique reference verification with biller ${request.transaction.details.biller_id} failed: ${verifyCustomer.message}`);
                throw new CustomerVerificationError(`Customer unique reference verification with biller ${request.transaction.details.biller_id} failed: ${verifyCustomer.message}`);
            } // Continue with product listing if verification was successful
        }

        const services = await listServiceProductsAPI(requestPayload.token, billerId, (request.transaction.customer.customer_ref) ? request.transaction.customer.customer_ref : null);

        if (services.status == CONSTANTS.PAYANT_STATUS_TYPES.error) {
            logger.error(`An error occured on attempt to fetch "${request.request_type}" service products: ${services.message}`);
            throw new ServiceProductCategoryError(`An error occured on attempt to fetch "${request.request_type}" service products`);
        }

        const orderReference = generateRandomReference();
        const transactionRef = generateRandomReference();
        const mappedServices = mapServiceProducts(services.data, orderReference, transactionRef);

        //Persist transaction request
        await this.storeTransaction(request, services, mappedServices);
        return mappedServices;
    }

    async buyAirtimeService(request) {
        const requestPayload = request.data;
        const token = request.token;

        if (requestPayload.auth.route_mode != CONSTANTS.REQUEST_TYPES.TRANSACT) {
            logger.error('Request mode has to be passed as transact to make a service call');
            throw new InvalidRequestModeError('Request mode has to be passed as transact to make a service call');
        }

        if (requestPayload.request_type != CONSTANTS.REQUEST_TYPES.BUY_AIRTIME) {
            logger.error('Request type has be to passed as buy_airtime');
            throw new InvalidParamsError('Request type has be to passed as buy_airtime ');
        }

        if (!requestPayload.transaction.details.order_reference) {
            logger.error('Order Reference is a required param for transact calls.');
            throw new InvalidParamsError('Order Reference is a required param for transact calls.');
        }
        await new Transaction().fetchTransactionByOrderRef(requestPayload.transaction.details.order_reference); // Fetch active transaction by order refrence

        if(!requestPayload.transaction.details || !requestPayload.transaction.details.telco_code) {
            logger.error(`Telco code (biller id) has to be passed in details object nested in transaction object`);
            throw new InvalidParamsError('Biller id (telco_code) is not provided');
        }

        if(!config.service_biller_ids.buy_airtime.hasOwnProperty(requestPayload.transaction.details.telco_code)) {
            logger.error(`Service "buy_airtime" does not support biller: ${requestPayload.transaction.details.telco_code}`);
            throw new BillerNotSupportedError(`Biller ${requestPayload.transaction.details.telco_code} is not supported by service buy_airtime`)
        }

        if(!requestPayload.transaction.customer.customer_ref || !requestPayload.transaction.amount) {
            logger.error('customer_ref (phone number) or amount is not provided');
            throw new InvalidParamsError('Phone number or amount is not provided');
        }

        const postDetails = {
            amount: requestPayload.transaction.amount,
            service_category_id: config.service_biller_ids.buy_airtime[`${requestPayload.transaction.details.telco_code}`],
            phonenumber: requestPayload.transaction.customer.customer_ref,
            status_url: CONSTANTS.SERVICE_STATUS_URL.BUY_AIRTIME
        };

        const airtimeResponse = await payantServiceApiCall(token, CONSTANTS.URL_PATHS.airtime, postDetails, (data) => {
            if (data.status === CONSTANTS.PAYANT_STATUS_TYPES.error) {
                logger.error(`Provider error response on attempt to make airtime purchase: ${data.message}`);
                throw new ProviderResponseError(`Provider error response on attempt to make airtime purchase: ${data.message}`);
            }

            const referenceCode = data.transaction.response_payload.data.msg.results.refCode;
            const processedTransaction = getTransactionStatus(token, referenceCode);

            if (processedTransaction.status === CONSTANTS.PAYANT_STATUS_TYPES.error) {
                logger.error(`Provider error response on attempt to fetch airtime purchase transaction status: ${data.message}`);
                throw new ProviderResponseError(`Provider error response on attempt to fetch airtime purchase transaction status: ${data.message}`);
            }

            return processedTransaction;
        });

        const serviceRawResponse = airtimeResponse.data.response_payload;
        const airtime = mapAirtimeResponse(serviceRawResponse.data.msg.results, serviceRawResponse.data.amount, requestPayload.transaction.details.order_reference);

        await this.storeTransaction(requestPayload, serviceRawResponse, airtime);
        return airtime;
    }

    async buyDataService(request) {
        const requestPayload = request.data;
        const token = request.token;

        if (requestPayload.auth.route_mode != CONSTANTS.REQUEST_TYPES.TRANSACT) {
            logger.error('Request mode has to be passed as transact to make a service call');
            throw new InvalidRequestModeError('Request mode has to be passed as transact to make a service call');
        }

        if (requestPayload.request_type != CONSTANTS.REQUEST_TYPES.BUY_DATA) {
            logger.error('Request type has be to passed as buy_data');
            throw new InvalidParamsError('Request type has be to passed as buy_data ');
        }

        if (!requestPayload.transaction.details.order_reference) {
            logger.error('Order Reference is a required param for transact calls.');
            throw new InvalidParamsError('Order Reference is a required param for transact calls.');
        }
        await new Transaction().fetchTransactionByOrderRef(requestPayload.transaction.details.order_reference); // Fetch active transaction by order refrence

        if(!requestPayload.transaction.details || !requestPayload.transaction.details.biller_id || !requestPayload.transaction.details.biller_item_id) {
            logger.error(`Biller id or biller item id has to be passed in details object nested in transaction object`);
            throw new InvalidParamsError('Biller id or biller item id is not provided');
        }

        if(!config.service_biller_ids.buy_data.hasOwnProperty(requestPayload.transaction.details.biller_id)) {
            logger.error(`Service "buy_data" does not support biller: ${requestPayload.transaction.details.biller_id}`);
            throw new BillerNotSupportedError(`Biller ${requestPayload.transaction.details.biller_id} is not supported by service buy_data`)
        }

        if(!requestPayload.transaction.customer.customer_ref || !requestPayload.transaction.amount) {
            logger.error('customer_ref (phone number), amount, or bundleCode (biller_item_id) is not provided');
            throw new InvalidParamsError('Phone number, amount, or bundleCode (biller_item_id) is not provided');
        }

        const postDetails = {
            amount: requestPayload.transaction.amount,
            service_category_id: config.service_biller_ids.buy_data[`${requestPayload.transaction.details.biller_id}`],
            account: requestPayload.transaction.customer.customer_ref,
            bundleCode: requestPayload.transaction.details.biller_item_id,
            quantity: 1,
            status_url: CONSTANTS.SERVICE_STATUS_URL.BUY_AIRTIME
        };

        const dataResponse = await payantServiceApiCall(token, CONSTANTS.URL_PATHS.data, postDetails, (data) => {
            if (data.status === CONSTANTS.PAYANT_STATUS_TYPES.error) {
                logger.error(`Provider error response on attempt to make data purchase: ${data.message}`);
                throw new ProviderResponseError(`Provider error response on attempt to make data purchase: ${data.message}`);
            }

            const referenceCode = data.transaction.response_payload.data.msg.results.refCode;
            const processedTransaction = getTransactionStatus(token, referenceCode);

            if (![CONSTANTS.PAYANT_STATUS_TYPES.successful, CONSTANTS.PAYANT_STATUS_TYPES.pending].includes(processedTransaction.status)) {
                logger.error(`Provider error response on attempt to fetch data purchase transaction status: ${data.message}`);
                throw new ProviderResponseError(`Provider error response on attempt to fetch data purchase transaction status: ${data.message}`);
            }

            return processedTransaction;
        });

        const serviceRawResponse = dataResponse.data.response_payload;
        const data = mapDataResponse(serviceRawResponse.data.msg.results, serviceRawResponse.data.amount, requestPayload.transaction.details.order_reference);

        await this.storeTransaction(requestPayload, serviceRawResponse, data);
        return data;
    }

    async buyElectricityService(request) {
        const requestPayload = request.data;
        const token = request.token;

        if (requestPayload.auth.route_mode != CONSTANTS.REQUEST_TYPES.TRANSACT) {
            logger.error('Request mode has to be passed as transact to make a service call');
            throw new InvalidRequestModeError('Request mode has to be passed as transact to make a service call');
        }

        if (requestPayload.request_type != CONSTANTS.REQUEST_TYPES.PAY_ELECTRICITY) {
            logger.error('Request type has be to passed as pay_electricity');
            throw new InvalidParamsError('Request type has be to passed as pay_electricity ');
        }

        if (!requestPayload.transaction.details.order_reference) {
            logger.error('Order Reference is a required param for transact calls.');
            throw new InvalidParamsError('Order Reference is a required param for transact calls.');
        }
        await new Transaction().fetchTransactionByOrderRef(requestPayload.transaction.details.order_reference); // Fetch active transaction by order refrence

        if (!requestPayload.transaction.details || !requestPayload.transaction.details.biller_id) {
            logger.error(`Biller id has to be passed in details object nested in transaction object`);
            throw new InvalidParamsError('Biller id is not provided');
        }

        if (!config.service_biller_ids.pay_electricity.hasOwnProperty(requestPayload.transaction.details.biller_id)) {
            logger.error(`Service "buy_electricity" does not support biller: ${requestPayload.transaction.details.biller_id}`);
            throw new BillerNotSupportedError(`Biller ${requestPayload.transaction.details.biller_id} is not supported by service buy_electricity`)
        }

        if (!requestPayload.transaction.amount || !requestPayload.transaction.customer.customer_ref || !requestPayload.transaction.customer.mobile_no) {
            logger.error(
                `Missing parameter - ${(!requestPayload.transaction.amount) ? 'amount' : ''}-${(!requestPayload.transaction.customer.customer_ref) ? 'customer_ref' : ''}-${(!requestPayload.transaction.customer.mobile_no) ? 'mobile_no' : ''}`
            );
            throw new InvalidParamsError(
                `Missing parameter - ${(!requestPayload.transaction.amount) ? 'amount' : ''}-${(!requestPayload.transaction.customer.customer_ref) ? 'customer_ref' : ''}-${(!requestPayload.transaction.customer.mobile_no) ? 'mobile_no' : ''}`
            );
        }

        const billerId = config.service_biller_ids[`${requestPayload.request_type}`][`${requestPayload.transaction.details.biller_id}`];
        const verifyCustomer = await payantServiceApiCall(token, `${CONSTANTS.URL_PATHS.list_services_products}/${billerId}/verify`, { account: requestPayload.transaction.customer.customer_ref });

        if (verifyCustomer.status != CONSTANTS.PAYANT_STATUS_TYPES.successful) {
            logger.error(`Customer unique reference verification with biller ${requestPayload.transaction.details.biller_id} failed: ${verifyCustomer.message}`);
            throw new CustomerVerificationError(`Customer unique reference verification with biller ${requestPayload.transaction.details.biller_id} failed: ${verifyCustomer.message}`);
        }

        const postDetails = {
            service_category_id: billerId,
            meter_number: requestPayload.transaction.customer.customer_ref,
            amount: requestPayload.transaction.amount,
            phone: requestPayload.transaction.customer.mobile_no
        };

        const electricityResponse = await payantServiceApiCall(token, CONSTANTS.URL_PATHS.buy_electricity, postDetails);
        const electricity = mapElectricityResponse(electricityResponse.transaction);

        await this.storeTransaction(requestPayload, electricityResponse, electricity);
        return electricity;
    }

    async buyTvService(request) {
        const requestPayload = request.data;
        const token = request.token;

        if (requestPayload.auth.route_mode != CONSTANTS.REQUEST_TYPES.TRANSACT) {
            logger.error('Request mode has to be passed as transact to make a service call');
            throw new InvalidRequestModeError('Request mode has to be passed as transact to make a service call');
        }

        if (requestPayload.request_type != CONSTANTS.REQUEST_TYPES.PAY_TV) {
            logger.error('Request type has be to passed as pay_tv');
            throw new InvalidParamsError('Request type has be to passed as pay_tv ');
        }

        if (!requestPayload.transaction.details.order_reference) {
            logger.error('Order Reference is a required param for transact calls.');
            throw new InvalidParamsError('Order Reference is a required param for transact calls.');
        }
        await new Transaction().fetchTransactionByOrderRef(requestPayload.transaction.details.order_reference); // Fetch active transaction by order refrence

        if(!requestPayload.transaction.details || !requestPayload.transaction.details.biller_id || !requestPayload.transaction.details.biller_item_id) {
            logger.error(`Biller id has to be passed in details object nested in transaction object`);
            throw new InvalidParamsError('Biller id is not provided');
        }

        if (!config.service_biller_ids.pay_tv.hasOwnProperty(requestPayload.transaction.details.biller_id)) {
            logger.error(`Service "pay_tv" does not support biller: ${requestPayload.transaction.details.biller_id}`);
            throw new BillerNotSupportedError(`Biller ${requestPayload.transaction.details.biller_id} is not supported by service pay_tv`)
        }

        if (!requestPayload.transaction.customer.customer_ref || !requestPayload.transaction.amount) {
            logger.error(`Missing parameter customer_ref [tv unique number] or amount`);
            throw new InvalidParamsError(`Missing parameter customer_ref [tv unique number] or amount`);
        }

        const billerId = config.service_biller_ids[`${requestPayload.request_type}`][`${requestPayload.transaction.details.biller_id}`];

        const verifyCustomer = await payantServiceApiCall(token, `${CONSTANTS.URL_PATHS.list_services_products}/${billerId}/verify`, { account: requestPayload.transaction.customer.customer_ref });

        if (verifyCustomer.status != CONSTANTS.PAYANT_STATUS_TYPES.successful) {
            logger.error(`Customer unique reference verification with biller ${requestPayload.transaction.details.biller_id} failed: ${verifyCustomer.message}`);
            throw new CustomerVerificationError(`Customer unique reference verification with biller ${requestPayload.transaction.details.biller_id} failed: ${verifyCustomer.message}`);
        }

        const postDetails = {
            service_category_id: billerId,
            smartcard: requestPayload.transaction.customer.customer_ref,
            bundleCode: requestPayload.transaction.amount,
            amount: requestPayload.transaction.amount,
            name: requestPayload.transaction.details.biller_item_id,
            invoicePeriod: CONSTANTS.INVOICE_PERIOD,
            phone: requestPayload.transaction.customer.mobile_no,
        }

        const tvResponse = await payantServiceApiCall(token, CONSTANTS.URL_PATHS.buy_tv, postDetails);
        const tv = mapTvResponse(requestPayload, tvResponse);

        await this.storeTransaction(requestPayload, tvResponse, tv);
        return tv;
    }

    async buyScratchCardService(request) {
        const requestPayload = request.data;
        const token = request.token;

        if (requestPayload.auth.route_mode != CONSTANTS.REQUEST_TYPES.TRANSACT) {
            logger.error('Request mode has to be passed as transact to make a service call');
            throw new InvalidRequestModeError('Request mode has to be passed as transact to make a service call');
        }
        
        if (requestPayload.request_type != CONSTANTS.REQUEST_TYPES.BUY_SCRATCH_CARD) {
            logger.error('Request type has be to passed as buy_scratch_card');
            throw new InvalidParamsError('Request type has be to passed as buy_scratch_card ');
        }

        if (!requestPayload.transaction.details.order_reference) {
            logger.error('Order Reference is a required param for transact calls.');
            throw new InvalidParamsError('Order Reference is a required param for transact calls.');
        }
        await new Transaction().fetchTransactionByOrderRef(requestPayload.transaction.details.order_reference); // Fetch active transaction by order refrence

        if (!requestPayload.transaction.details || !requestPayload.transaction.details.biller_id) {
            logger.error(`Biller id has to be passed in details object nested in transaction object`);
            throw new InvalidParamsError('Biller id [waec] is not provided');
        }

        if (!config.service_biller_ids.buy_scratch_card.hasOwnProperty(requestPayload.transaction.details.biller_id)) {
            logger.error(`Service "buy_scratch_card" does not support biller: ${requestPayload.transaction.details.biller_id}`);
            throw new BillerNotSupportedError(`Biller ${requestPayload.transaction.details.biller_id} is not supported by service buy_scratch_card`)
        }

        if (!requestPayload.transaction.amount) {
            logger.error('Required parameter amount was not provided');
            throw new InvalidParamsError('Required parameter amount was not provided');
        }

        const billerId = config.service_biller_ids[`${requestPayload.request_type}`][`${requestPayload.transaction.details.biller_id}`];

        const postDetails = {
            service_category_id: billerId,
            pins: 1,
            amount: requestPayload.transaction.amount
        };
        const scratchCardResponse = await payantServiceApiCall(token, CONSTANTS.URL_PATHS.buy_scratch_card, postDetails);
        const scratchCard = mapScratchCardResponse(scratchCardResponse.transaction, generateRandomReference());

        await this.storeTransaction(requestPayload, scratchCardResponse, scratchCard);
        return scratchCard;
    }

    async lookupNinMinService(request) {
        const requestPayload = request.data;
        const orderReference = generateRandomReference();

        if (requestPayload.auth.route_mode == CONSTANTS.REQUEST_TYPES.VALIDATE) {
            return await this.validateOtp(requestPayload);
        }

        if (requestPayload.auth.route_mode != CONSTANTS.REQUEST_TYPES.TRANSACT) {
            logger.error('Request mode has to be passed as transact to make a service call');
            throw new InvalidRequestModeError('Request mode has to be passed as transact to make a service call');
        }
        if (!requestPayload.auth.secure) {
            logger.error(`Missing NIN in auth secure [nin mid]`);
            throw new InvalidParamsError(`Missing parameter NIN in auth secure [nin mid]`);
        }
        if (!requestPayload.transaction.app_info.extras["secret_key"]) {
            logger.error(`Missing parameter secret keyin app extras [nin min]`);
            throw new InvalidParamsError(`Missing parameter secret keyin app extras [nin min]`);
        }

        const postDetails = {
            method: 'SMS',
            type: 'NIN',
            number: requestPayload.auth.secure,
            secretKey : requestPayload.transaction.app_info.extras["secret_key"]
        };
        const identityResponse = await payantIdentityApiCall(postDetails);

        if (identityResponse.status != CONSTANTS.PAYANT_STATUS_TYPES.successful) {
            logger.error(`Identity pull request failed`);
            throw new CustomerVerificationError(`Identity pull request failed`);
        }

        if ((requestPayload.transaction.details && requestPayload.transaction.details.otp_override == true) || (requestPayload.transaction.app_info && requestPayload.transaction.app_info.extras && requestPayload.transaction.app_info.extras.otp_override == true)) {
            const transactionDetails = mapTransactionDetails(requestPayload.request_ref, requestPayload.transaction.transaction_ref, requestPayload, identityResponse, mapMinNinResponse(identityResponse, orderReference), CONSTANTS.REQUEST_TYPES.TRANSACT, orderReference, true, null);
            await new Transaction().createTransaction(transactionDetails);
            return mapMinNinResponse(identityResponse);
        }

        const otp = generateOTP();
        const transactionDetails = mapTransactionDetails(requestPayload.request_ref, requestPayload.transaction.transaction_ref, requestPayload, identityResponse, mapMinNinResponse(identityResponse, orderReference), CONSTANTS.REQUEST_TYPES.TRANSACT, orderReference, true, otp);
        await new Transaction().createTransaction(transactionDetails);

        const smsData = {
            senderName: 'OnePipe - Verify OTP',
            recipientPhoneNumber: requestPayload.transaction.customer.mobile_no,
            message: `Hello ${requestPayload.transaction.customer.surname}, here's the otp to validate fecthing your identity details: ${otp}. Please contact us if you did not initiate this request`
        };

        await sendOTP(smsData);
        return {
            reference: orderReference,
            message: `${ResponseMessages.SUCCESSFULLY_SENT_OTP} ${hashPhoneNumber(requestPayload.transaction.customer.customer_ref)}`
        };
    }

    async lookupNinMidService(request) {
        const requestPayload = request.data;
        const orderReference = generateRandomReference();

        if (requestPayload.auth.route_mode == CONSTANTS.REQUEST_TYPES.VALIDATE) {
            return await this.validateOtp(requestPayload);
        }

        if (requestPayload.auth.route_mode != CONSTANTS.REQUEST_TYPES.TRANSACT) {
            logger.error('Request mode has to be passed as transact to make a service call');
            throw new InvalidRequestModeError('Request mode has to be passed as transact to make a service call');
        }
        
        if (!requestPayload.auth.secure) {
            logger.error(`Missing NIN in auth secure [nin mid]`);
            throw new InvalidParamsError(`Missing parameter NIN in auth secure [nin mid]`);
        }
        if (!requestPayload.transaction.app_info.extras["secret_key"]) {
            logger.error(`Missing parameter secret keyin app extras [nin mid]`);
            throw new InvalidParamsError(`Missing parameter secret keyin app extras [nin mid]`);
        }

        const postDetails = {
            method: 'SMS',
            type: 'NIN',
            number: requestPayload.auth.secure,
            secretKey : requestPayload.transaction.app_info.extras["secret_key"]
        };
        const identityResponse = await payantIdentityApiCall(postDetails);

        if (identityResponse.status != CONSTANTS.PAYANT_STATUS_TYPES.successful) {
            logger.error(`Identity pull request failed`);
            throw new CustomerVerificationError(`Identity pull request failed`);
        }

        if ((requestPayload.transaction.details && requestPayload.transaction.details.otp_override == true) || (requestPayload.transaction.app_info && requestPayload.transaction.app_info.extras && requestPayload.transaction.app_info.extras.otp_override == true)) {
            const transactionDetails = mapTransactionDetails(requestPayload.request_ref, requestPayload.transaction.transaction_ref, requestPayload, identityResponse, mapMidNinResponse(identityResponse, orderReference), CONSTANTS.REQUEST_TYPES.TRANSACT, orderReference, true, null);
            await this.storeTransaction(transactionDetails);
            return mapMidNinResponse(identityResponse);
        }

        const otp = generateOTP();
        const transactionDetails = mapTransactionDetails(requestPayload.request_ref, requestPayload.transaction.transaction_ref, requestPayload, identityResponse, mapMinNinResponse(identityResponse, orderReference), CONSTANTS.REQUEST_TYPES.TRANSACT, orderReference, true, otp);
        await new Transaction().createTransaction(transactionDetails);

        const smsData = {
            senderName: 'OnePipe - Verify OTP',
            recipientPhoneNumber: requestPayload.transaction.customer.mobile_no,
            message: `Hello ${requestPayload.transaction.customer.surname}, here's the otp to validate fecthing your identity details: ${otp}. Please contact us if you did not initiate this request`
        };

        await sendOTP(smsData);
        return {
            reference: orderReference,
            message: `${ResponseMessages.SUCCESSFULLY_SENT_OTP} ${hashPhoneNumber(requestPayload.transaction.customer.customer_ref)}`
        };
    }

    async validateOtp(requestPayload) {
        if (!requestPayload.transaction.transaction_ref || !requestPayload.auth.secure) {
            logger.error(`Missing parameters: otp or transaction reference`);
            throw new InvalidParamsError(`Required parameter otp and transaction reference`);
        }

        const transaction = new Transaction.fetchTransactionByOrderRef(requestPayload.transaction.transaction_ref);

        if (requestPayload.auth.secure != transaction.otp) {
            logger.error('Invalid otp was provided');
            throw new InvalidOtpError(`Invalid otp`);
        }
        
        return JSON.parse(transaction.provider_response);
    }


    async queryTransactionBuilder(requestPayload, transactionData) {
        const fetchedTransaction = null;
        const transaction = await new Transaction().fetchTransactionByReference(transactionData);
        if (transaction.providerResponse !== 'success') {
            if ((requestPayload.auth && requestPayload.auth.secure == ';') && (!requestPayload.transaction.app_info || !requestPayload.transaction.app_info.extras || requestPayload.transaction.app_info.extras.phone_number == '')) {
                logger.error('Invalid authentication details - No authentication detail');
                throw new AutheticationError(ResponseMessages.NO_AUTH_DETAILS_PROVIDED);
            }

            const authUserData = await authUser(requestPayload);
            const payantFetchedTransaction = getTransactionStatus(authUserData.token, transaction.providerTransactionRef);

            fetchedTransaction = payantFetchedTransaction.data.response_payload.data.msg.results;
        } else {
            fetchedTransaction = JSON.parse(transaction.mappedResponse);
        }

        return fetchedTransaction;
    }

    /**
     * Store transaction for each request made
     * @param {request paylaod && response payload} transactionDetails 
     */
    async storeTransaction(request, serviceRawResponse, mappedResponse) {
        const transactionDetails = mapTransactionDetails(request.request_ref, request.transaction.transaction_ref, request, serviceRawResponse, mappedResponse, CONSTANTS.REQUEST_TYPES.TRANSACT);
        await new Transaction().createTransaction(transactionDetails);
    }
}

module.exports = BaseService;
