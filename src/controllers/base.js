const { failed, success, optionsSuccess, waitingForOTP, failedRequest } = require('../utils/http_response');
const CONSTANTS = require('../constants/constant');
const ResponseMessage = require('../constants/response_messages');
const {
    InvalidRequestModeError,
    BillerProductError,
    BillerNotSupportedError,
    ServiceProductCategoryError,
    InvalidParamsError,
    TransactionNotFoundError,
    CustomerVerificationError
} = require('../error/index');
const logger = require('../utils/logger');
const BaseService = require('../services/base');

class BaseController {
    async buyAirtime(req, res) {
        try {
            const serviceResponse = await new BaseService().buyAirtimeService(req.body);
            if(serviceResponse.error!=null){
                return failedRequest(res, CONSTANTS.STATUS_CODES.FAILED, "Transaction failed", serviceResponse);
            }
            return success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse);
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

            if (err instanceof BillerProductError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof ServiceProductCategoryError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            logger.error(`Internal Server Error: Error occured on making transact request: ${err.message}`);
            failed(res, 500, err.message, err.stack);
            throw err;
        }
    }

    async buyData(req, res) {
        try {
            const serviceResponse = await new BaseService().buyDataService(req.body);
            if(serviceResponse.isOptionsCall){
                return optionsSuccess(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse);
            }
            return success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse);
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

            if (err instanceof BillerProductError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof ServiceProductCategoryError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            logger.error(`Internal Server Error: Error occured on making transact request: ${err.message}`);
            failed(res, 500, err.message, err.stack);
            throw err;  
        }
    }

    async payElectricity(req, res) {
        try {
            const serviceResponse = await new BaseService().buyElectricityService(req.body);
            return success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse);
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

            if (err instanceof BillerProductError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof ServiceProductCategoryError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            logger.error(`Internal Server Error: Error occured on making transact request: ${err.message}`);
            failed(res, 500, err.message, err.stack);
            throw err; 
        }
    }

    async payTv(req, res) {
        try {
            const serviceResponse = await new BaseService().buyTvService(req.body);
            if(serviceResponse.isOptionsCall){
                return optionsSuccess(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse);
            }
            return success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse);
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

            if (err instanceof BillerProductError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof ServiceProductCategoryError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            logger.error(`Internal Server Error: Error occured on making transact request: ${err.message}`);
            failed(res, 500, err.message, err.stack);
            throw err;
        }
    }

    async buyScratchCard(req, res) {
        try {
            const serviceResponse = await new BaseService().buyScratchCardService(req.body);
            if(serviceResponse.error!=null){
                return failedRequest(res, CONSTANTS.STATUS_CODES.FAILED, "Transaction failed", serviceResponse);
            }
            return success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse);
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

            if (err instanceof BillerProductError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof ServiceProductCategoryError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            logger.error(`Internal Server Error: Error occured on making transact request: ${err.message}`);
            failed(res, 500, err.message, err.stack);
            throw err;
        }
    }

    async lookupNinMin(req, res) {
        try {
            const serviceResponse = await new BaseService().lookupNinMinService(req.body);
            const isOtpOverride = serviceResponse.isOtpOverride;
            delete serviceResponse.isOtpOverride;
            return (isOtpOverride) ?
            success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse)
            : 
            waitingForOTP(res, CONSTANTS.STATUS_CODES.WAITING_FOR_OTP, serviceResponse);
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

            if (err instanceof CustomerVerificationError) {
                failed(res, 400, err.message, err.stack);
                throw err;
            }

            if (err instanceof BillerNotSupportedError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof BillerProductError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof ServiceProductCategoryError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            logger.error(`Internal Server Error: Error occured on making transact request: ${err}`);
            failed(res, 500, err.message, err.stack);
            throw err;  
        }
    }

    async lookupNinMid(req, res) {
        try {
            const serviceResponse = await new BaseService().lookupNinMidService(req.body);
            const isOtpOverride = serviceResponse.isOtpOverride;
            delete serviceResponse.isOtpOverride;
            return (isOtpOverride) ?
            success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.TRANSACTION_SUCCESSFUL, serviceResponse)
            : 
            waitingForOTP(res, CONSTANTS.STATUS_CODES.WAITING_FOR_OTP, serviceResponse);
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

            if (err instanceof CustomerVerificationError) {
                failed(res, 400, err.message, err.stack);
                throw err;
            }

            if (err instanceof BillerNotSupportedError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof BillerProductError) {
                failed(res, 500, err.message, err.stack);
                throw err;
            }

            if (err instanceof ServiceProductCategoryError) {
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