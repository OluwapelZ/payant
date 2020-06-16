const { encrypt } = require('../utils/crypt');
const config = require('../config/config');
const CONSTANTS = require('../constants/constant');
const ResponseMessages = require('../constants/response_messages');
const { mapErrorResponse, mapWaitingForOTP } = require('../utils/mapper');

function success(res, statusCode, message, data=null) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify({status: CONSTANTS.REQUEST_STATUSES.SUCCESSFUL, message: message, data: data}))});
};

function optionsSuccess(res, statusCode, data=null) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify({status: CONSTANTS.REQUEST_STATUSES.OPTIONS_DELIVERED, message: ResponseMessages.TRANSACTION_SUCCESSFUL, data: data}))});
}

function failed(res, statusCode, message, stack=null) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify(mapErrorResponse(message, stack)))});
};

function waitingForOTP(res, statusCode, message) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify(mapWaitingForOTP(message)))})
};

function wrongAuthProvder(res, statusCode, message) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify({ status: CONSTANTS.REQUEST_STATUSES.FAILED, message: message }))})
};

module.exports = { success, optionsSuccess, failed, waitingForOTP, wrongAuthProvder }