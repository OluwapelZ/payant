const { failed, success, optionsSuccess, waitingForOTP } = require('../utils/http_response');
const CONSTANTS = require('../constants/constant');
const ResponseMessage = require('../constants/response_messages');
const {
    InvalidRequestModeError,
    BillerProductError,
    BillerNotSupportedError,
    ServiceProductCategoryError,
    InvalidParamsError,
    TransactionNotFoundError
} = require('../error/index');
const logger = require('../utils/logger');
const BaseService = require('../services/base');

class BaseController {

    async listProviderProducts(req, res) {
        try {
            const products = await new BaseService().listProviderServices(req.body);
            optionsSuccess(res, CONSTANTS.STATUS_CODES.SUCCESS, products)
        } catch (err) {
            if (err instanceof InvalidRequestModeError) {
                failed(res, 400, err.message, err.stack);
                throw err;
            }

            if (err instanceof BillerProductError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof BillerNotSupportedError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof ServiceProductCategoryError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            logger.error(`Internal Server Error: Error occured on listing available provider products: ${err.message}`);
            failed(res, 500, err.message, err.stack);
            throw err;
        }
    }

    async transact(req, res) {
        try {
            const serviceResponse = await new BaseService().baseService(req.body);
            console.log('Controller: ',serviceResponse)
            process.exit();
            return (req.body.data.transaction.details.otp_override == true || (req.body.data.transaction.app_info && req.body.data.transaction.app_info.extras && req.body.data.transaction.app_info.extras.otp_override == true)) ?
            waitingForOTP(res, CONSTANTS.STATUS_CODES.SUCESS, serviceResponse) :
            success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse);
        } catch (err) {
            if (err instanceof InvalidParamsError) {
                failed(res, 400, err.message, err.stack);
                throw err;
            }

            if (err instanceof InvalidRequestModeError) {
                failed(res, 400, err.message, err.stack);
                throw err;
            }

            if (err instanceof TransactionNotFoundError) {
                failed(res, 400, err.message, err.stack);
                throw err;
            }

            if (err instanceof BillerNotSupportedError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            logger.error(`Internal Server Error: Error occured on making transact request: ${err.message}`);
            failed(res, 500, err.message, err.stack);
            throw err;
        }
    }
}

module.exports = BaseController;