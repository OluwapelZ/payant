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
    ServiceNotImplementedError, InvalidParamsError, ProviderResponseError, CustomerVerificationError, InvalidOtpError
} = require('../error');
const CONSTANTS = require('../constants/constant');
const ResponseMessages = require('../constants/response_messages');
const config = require('../config/config');
const Transaction = require('../models/transaction');
const logger = require('../utils/logger');

class BaseService {
    async baseService(requestPayload) {
        const request = requestPayload.data;

        let serviceRawResponse = null;
        let mappedServicesResponse = null;

        if (request.auth.route_mode == CONSTANTS.REQUEST_TYPES.VALIDATE) {
            return await this.validateOtp(requestPayload);
        }

        if (request.auth.route_mode != CONSTANTS.REQUEST_TYPES.TRANSACT) {
            logger.error('Request mode has to be passed as transact to make a service call');
            throw new InvalidRequestModeError('Request mode has to be passed as transact to make a service call');
        }

        if (!['lookup_nin_min', 'lookup_nin_mid'].includes(request.request_type)) {
            if (!request.transaction.details.order_reference) {
                logger.error('Order Reference is a required param for transact calls.');
                throw new InvalidParamsError('Order Reference is a required param for transact calls. !Excluding lookup nin!');
            }

            await new Transaction().fetchTransactionByOrderRef(request.transaction.details.order_reference); // Fetch active transaction by order refrence
        }

        switch(request.request_type) {
            case 'buy_airtime':
                const airtimeResponse = await this.buyAirtimeService(request, requestPayload.token);
                serviceRawResponse = airtimeResponse.data.response_payload;
                mappedServicesResponse = mapAirtimeResponse(serviceRawResponse.data.msg.results, response.data.amount, request.transaction.details.order_reference);
                break;
            case 'buy_data':
                const dataResponse = await this.buyDataService(request, requestPayload.token);
                serviceRawResponse = dataResponse.data.response_payload;
                mappedServicesResponse = mapDataResponse(serviceRawResponse.data.msg.results, response.data.amount, request.transaction.details.order_reference);
                break;
            case 'pay_electricity':
                serviceRawResponse = await this.buyElectricityService(request, requestPayload.token);
                mappedServicesResponse = mapElectricityResponse(serviceRawResponse.transaction);
                break;
            case 'pay_tv':
                serviceRawResponse = await this.buyTvService(request, requestPayload.token);
                mappedServicesResponse = mapTvResponse(request, serviceRawResponse);
                break;
            case 'buy_scratch_card':
                serviceRawResponse = await this.buyScratchCardService(request, requestPayload.token);
                mappedServicesResponse = mapScratchCardResponse(serviceRawResponse.transaction, generateRandomReference());
                break;
            case 'lookup_nin_min':
                serviceRawResponse = await this.lookupNinMinService(request);
                if (request.transaction.details.otp_override == true || (request.transaction.app_info && request.transaction.app_info.extras && request.transaction.app_info.extras.otp_override == true)) {
                    return serviceRawResponse;
                }
                
                return mapMinNinResponse(serviceRawResponse);
            case 'lookup_nin_mid':
                serviceRawResponse = await this.lookupNinMidService(request);
                if (request.transaction.details.otp_override == true || (request.transaction.app_info && request.transaction.app_info.extras && request.transaction.app_info.extras.otp_override == true)) {
                    return serviceRawResponse;
                }
                
                return mapMidNinResponse(serviceRawResponse);
            default:
                logger.error(`Request was made to a service ${request.request_type} currently not implemented`);
                throw new ServiceNotImplementedError(`Service ${request.request_type} is currently not implemented`);
        }

        const transactionDetails = mapTransactionDetails(request.request_ref, request.transaction.transaction_ref, request, serviceRawResponse, CONSTANTS.REQUEST_TYPES.TRANSACT);
        await this.storeTransaction(transactionDetails);

        return mappedServicesResponse;
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
        const transactionDetails = mapTransactionDetails(request.request_ref, request.transaction.transaction_ref, request, services, CONSTANTS.REQUEST_TYPES.OPTIONS, orderReference, true, null);
        await this.storeTransaction(transactionDetails);

        return mappedServices;
    }

    async buyAirtimeService(requestPayload, token) {
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

        return payantServiceApiCall(token, CONSTANTS.URL_PATHS.airtime, postDetails, (data) => {
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
    }

    async buyDataService(requestPayload, token) {
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

        return payantServiceApiCall(token, CONSTANTS.URL_PATHS.data, postDetails, (data) => {
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
    }

    async buyElectricityService(requestPayload, token) {
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

        return await payantServiceApiCall(token, CONSTANTS.URL_PATHS.buy_electricity, postDetails);
    }

    async buyTvService(requestPayload, token) {
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

        return await payantServiceApiCall(token, CONSTANTS.URL_PATHS.buy_tv, postDetails);
    }

    async buyScratchCardService(requestPayload, token) {
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
        return await payantServiceApiCall(token, CONSTANTS.URL_PATHS.buy_scratch_card, postDetails);
    }

    async lookupNinMinService(requestPayload) {
        if (!requestPayload.transaction.customer.customer_ref) {
            logger.error(`Missing parameter customer_ref [nin min]`);
            throw new InvalidParamsError(`Missing parameter customer_ref [nin min]`);
        }

        const postDetails = {
            method: 'SMS',
            type: 'NIN',
            number: requestPayload.transaction.customer.customer_ref
        };
        const identityResponse = await payantIdentityApiCall(postDetails);

        if (identityResponse.status != CONSTANTS.PAYANT_STATUS_TYPES.successful) {
            logger.error(`Identity pull request failed`);
            throw new CustomerVerificationError(`Identity pull request failed`);
        }

        if ((requestPayload.transaction.details && requestPayload.transaction.details.otp_override == true) || (requestPayload.transaction.app_info && requestPayload.transaction.app_info.extras && requestPayload.transaction.app_info.extras.otp_override == true)) {
            return identityResponse;
        }

        const otp = generateOTP();
        const orderReference = generateRandomReference();
        const transactionDetails = mapTransactionDetails(requestPayload.request_ref, requestPayload.transaction.transaction_ref, requestPayload, mapMinNinResponse(identityResponse, orderReference), CONSTANTS.REQUEST_TYPES.TRANSACT, orderReference, true, orderReference);
        await this.storeTransaction(transactionDetails);

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

    async lookupNinMidService(requestPayload) {
        if (!requestPayload.transaction.customer.customer_ref) {
            logger.error(`Missing parameter customer_ref [nin mid]`);
            throw new InvalidParamsError(`Missing parameter customer_ref [nin mid]`);
        }

        const postDetails = {
            method: 'SMS',
            type: 'NIN',
            number: requestPayload.transaction.customer.customer_ref
        };
        const identityResponse = await payantIdentityApiCall(postDetails);

        if (identityResponse.status != CONSTANTS.PAYANT_STATUS_TYPES.successful) {
            logger.error(`Identity pull request failed`);
            throw new CustomerVerificationError(`Identity pull request failed`);
        }

        if ((requestPayload.transaction.details && requestPayload.transaction.details.otp_override == true) || (requestPayload.transaction.app_info && requestPayload.transaction.app_info.extras && requestPayload.transaction.app_info.extras.otp_override == true)) {
            const orderReference = generateRandomReference();
            const transactionDetails = mapTransactionDetails(requestPayload.request_ref, requestPayload.transaction.transaction_ref, requestPayload, mapMidNinResponse(identityResponse, orderReference), CONSTANTS.REQUEST_TYPES.TRANSACT, orderReference, true, null);
            await this.storeTransaction(transactionDetails);
            return identityResponse;
        }

        const otp = generateOTP();
        const orderReference = generateRandomReference();
        const transactionDetails = mapTransactionDetails(requestPayload.request_ref, requestPayload.transaction.transaction_ref, requestPayload, mapMidNinResponse(identityResponse, orderReference), CONSTANTS.REQUEST_TYPES.TRANSACT, orderReference, true, otp);
        await this.storeTransaction(transactionDetails);

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

    /**
     * Store transaction for each request made
     * @param {request paylaod && response payload} transactionDetails 
     */
    async storeTransaction(transactionDetails) {
        await new Transaction().createTransaction(transactionDetails);
    }
}

module.exports = BaseService;
