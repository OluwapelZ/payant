const { listServiceProductsAPI, buyAirtime, buyData } = require('../utils/third_party_api_call');
const { mapServiceProducts, mapTransactionDetails } = require('../utils/mapper');
const { InvalidRequestModeError, BillerProductError, ServiceProductCategoryError } = require('../error');
const CONSTANTS = require('../constants/constant');
const config = require('../config/config');
const Transaction = require('../models/transaction');
const logger = require('../utils/logger');

class BaseService {
    async baseService(req) {
        let successMessage = '';
        let errorMessage = '';
    }
    
    async listProviderServices(requestPayload) {
        if (requestPayload.auth.route_mode != CONSTANTS.REQUEST_TYPES.OPTIONS) {
            logger.error('Request mode has to be passed as options to make an option call');
            throw new InvalidRequestModeError('Request mode has to be passed as options to make an option call');
        }

        if (!requestPayload.transaction.details || !requestPayload.transaction.details.biller_id) {
            logger.error('Product biller id has to be passed in the details object [nested in transaction object]');
            throw new BillerProductError('Product biller id has to be passed in details object [nested in transaction object]');
        }

        const billerId = config.service_biller_ids[`${requestPayload.request_type}`][`${requestPayload.transaction.details.biller_id}`];
        const services = await listServiceProductsAPI(req.body.token, billerId);

        if (services.status == CONSTANTS.PAYANT_STATUS_TYPES.error) {
            logger.error(`An error occured on attempt to fetch "${requestPayload.request_type}" service products: ${services.message}`);
            throw new ServiceProductCategoryError(`An error occured on attempt to fetch "${requestPayload.request_type}" service products`);
        }

        const mappedServices = mapServiceProducts(services);

        //Persist transaction request
        const transactionDetails = mapTransactionDetails(req.body.data.request_ref, req.body.data.transaction.transaction_ref, req.body.data, services)
        // await this.storeTransaction(transactionDetails);

        return mappedServices;
    }

    async buyAirtimeService(token, phoneNumber, amount) {
        const buyAirtimeResponse = await buyAirtime(token, amount, phoneNumber);
    }

    async buyDataService() {
        const buyDataResponse = await buyData();
    }

    /**
     * Store transaction for each request made
     * @param {request paylaod && response payload} transactionDetails 
     */
    async storeTransaction(transactionDetails) {
        const transaction = new Transaction();
        await transaction.createTransaction(transactionDetails);
    }
}

module.exports = BaseService;
