const { encrypt } = require('../utils/crypt');
const config = require('../config/config');
const CONSTANTS = require('../constants/constant');
const ResponseMessages = require('../constants/response_messages');
const { mapErrorResponse, mapWaitingForOTP, mapAPILogger } = require('../utils/mapper');
const { apiLogger } = require('../utils/third_party_api_call');

function success(res, statusCode, message, data=null) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify({status: CONSTANTS.REQUEST_STATUSES.SUCCESSFUL, message: message, data: data}))});
};

function optionsSuccess(res, statusCode, data=null) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify( {status: CONSTANTS.REQUEST_STATUSES.OPTIONS_DELIVERED, message: ResponseMessages.TRANSACTION_SUCCESSFUL, data: data}))});
}

function failed(req, res, statusCode, message) {
    apiLogger(mapAPILogger(req, res, {...message, statusCode}));
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify(mapErrorResponse(message)))});
};

function waitingForOTP(res, statusCode, data) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify(mapWaitingForOTP(data.message, data.reference)))})
};

function wrongAuthProvder(res, statusCode, message) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify({ status: CONSTANTS.REQUEST_STATUSES.FAILED, message: message }))})
};

module.exports = { success, optionsSuccess, failed, waitingForOTP, wrongAuthProvder }