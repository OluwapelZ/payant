const { failed, success, optionsSuccess } = require('../utils/http_response');
const CONSTANTS = require('../constants/constant');
const ResponseMessage = require('../constants/response_messages');
const {
    InvalidRequestModeError,
    BillerProductError,
    BillerNotSupportedError,
    ServiceProductCategoryError,
    InvalidParamsError
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
                failed(res, 500, err.message, err.stack);
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
            success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse);
        } catch (err) {
            if (err instanceof InvalidParamsError) {
                failed(res, 500, err.message, err.stack);
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