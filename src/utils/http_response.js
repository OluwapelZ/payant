const { encrypt } = require('../utils/crypt');
const config = require('../config/config');
const CONSTANTS = require('../config/constant');
const { mapErrorResponse } = require('../utils/mapper');

function success(res, statusCode, message, data=null) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify({status: CONSTANTS.REQUEST_STATUSES.SUCCESSFUL, message: message, data: data}))});
};

function failed(res, statusCode, message, stack) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify(mapErrorResponse(message, stack)))});
};

function waitingForOTP(res, statusCode, message) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify({ status: CONSTANTS.REQUEST_STATUSES.WAITING_FOR_OTP, message: message }))})
};

function wrongAuthProvder(res, statusCode, message) {
    res.status(statusCode).send({data: encrypt(config.crypt_key, JSON.stringify({ status: CONSTANTS.REQUEST_STATUSES.FAILED, message: message }))})
};

module.exports = { success, failed, waitingForOTP, wrongAuthProvder }