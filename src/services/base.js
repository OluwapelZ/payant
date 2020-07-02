const { listServiceProductsAPI, payantServiceApiCall, getTransactionStatus } = require('../utils/third_party_api_call');
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
    ServiceNotImplementedError, InvalidParamsError, ProviderResponseError,
} = require('../error');
const CONSTANTS = require('../constants/constant');
const config = require('../config/config');
const Transaction = require('../models/transaction');
const logger = require('../utils/logger');

class BaseService {
    async baseService(requestPayload) {
        const request = requestPayload.data;
        let serviceRawResponse = null;
        let mappedServicesResponse = null;

        if (request.auth.route_mode != CONSTANTS.REQUEST_TYPES.TRANSACT) {
            logger.error('Request mode has to be passed as transact to make a service call');
            throw new InvalidRequestModeError('Request mode has to be passed as transact to make a service call');
        }

        switch(request.request_type) {
            case 'buy_airtime':
                const response = await this.buyAirtimeService(request, requestPayload.token);
                serviceRawResponse = response.data.response_payload;
                mappedServicesResponse = mapAirtimeResponse(serviceRawResponse.data.msg.results, response.data.amount);
                break;
            case 'buy_data':
                serviceRawResponse = await this.buyDataService(request, requestPayload.token);
                mappedServicesResponse = mapDataResponse(serviceRawResponse)
                break;
            case 'pay_electricity':
                serviceRawResponse = await this.buyElectricityService(request, requestPayload.token);
                mappedServicesResponse = mapElectricityResponse(serviceRawResponse);
                break;
            case 'pay_tv':
                serviceRawResponse = await this.buyTvService(request, requestPayload.token);
                mappedServicesResponse = mapTvResponse(serviceRawResponse);
                break;
            case 'buy_scratch_card':
                serviceRawResponse = await this.buyScratchCardService(request, requestPayload.token);
                mappedServicesResponse = mapScratchCardResponse(serviceRawResponse);
                break;
            case 'lookup_nin_min':
                serviceRawResponse = await this.lookupNinMinService(request, requestPayload.token);
                mappedServicesResponse = mapMinNinResponse(serviceRawResponse);
                break;
            case 'lookup_nin_mid':
                serviceRawResponse = await this.lookupNinMidService(request, requestPayload.token);
                mappedServicesResponse = mapMidNinResponse(serviceRawResponse);
                break;
            default:
                logger.error(`Request was made to a service ${request.request_type} currently not implemented`);
                throw new ServiceNotImplementedError(`Service ${request.request_type} is currently not implemented`);
        }

        const transactionDetails = mapTransactionDetails(request.request_ref, request.transaction.transaction_ref, request, serviceRawResponse);
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

        const services = await listServiceProductsAPI(requestPayload.token, billerId);

        if (services.status == CONSTANTS.PAYANT_STATUS_TYPES.error) {
            logger.error(`An error occured on attempt to fetch "${request.request_type}" service products: ${services.message}`);
            throw new ServiceProductCategoryError(`An error occured on attempt to fetch "${request.request_type}" service products`);
        }

        const mappedServices = mapServiceProducts(services.data);

        //Persist transaction request
        const transactionDetails = mapTransactionDetails(request.request_ref, request.transaction.transaction_ref, request, services)
        await this.storeTransaction(transactionDetails);

        return mappedServices;
    }

    async buyAirtimeService(requestPayload, token) {
        if(!config.service_biller_ids.buy_airtime.hasOwnProperty(requestPayload.transaction.details.telco_code)) {
            logger.error(`Service "buy_airtime" does not support biller: ${requestPayload.transaction.details.telco_code}`);
            throw new BillerNotSupportedError(`Biller ${requestPayload.transaction.details.telco_code} is not supported by service buy_airtime`)
        }
        
        if(!requestPayload.transaction.details || !requestPayload.transaction.details.telco_code) {
            logger.error(`Telco code (biller id) has to be passed in details object nested in transaction object`);
            throw new InvalidParamsError('Biller id (telco_code) is not provided');
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
            const verifiedTransaction = getTransactionStatus(token, referenceCode);

            if (verifiedTransaction.status === CONSTANTS.PAYANT_STATUS_TYPES.error) {
                logger.error(`Provider error response on attempt to fetch airtime purchase status: ${data.message}`);
                throw new ProviderResponseError(`Provider error response on attempt to fetch airtime purchase status: ${data.message}`);
            }

            return verifiedTransaction;
        });
    }

    async buyDataService(requestPayload, token) {
        const postDetails = {};
        return await payantServiceApiCall(token, CONSTANTS.URL_PATHS.data, postDetails);
    }

    async buyElectricityService(requestPayload, token) {
        const postDetails = {};
        return await payantServiceApiCall(token, CONSTANTS.URL_PATHS.buy_electricity, postDetails);
    }

    async buyTvService(requestPayload, token) {
        const postDetails = {};
        return await payantServiceApiCall(token, CONSTANTS.URL_PATHS.buy_tv, postDetails);
    }

    async buyScratchCardService(requestPayload, token) {
        const postDetails = {};
        return await payantServiceApiCall(token, CONSTANTS.URL_PATHS.buy_scratch_card, postDetails);
    }

    async lookupNinMinService(requestPayload, token) {
        const postDetails = {};
        return await payantServiceApiCall(token, CONSTANTS.URL_PATHS.look_up_nin, postDetails);
    }

    async lookupNinMidService(requestPayload, token) {
        const postDetails = {};
        return await payantServiceApiCall(token, CONSTANTS.URL_PATHS.look_up_nin, postDetails);
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
