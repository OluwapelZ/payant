const axios = require('axios');
const config = require('../config/config');
const CONSTANTS = require('../constants/constant');
const logger = require('./logger');
const { mapAPILogger } = require('./mapper');
const { now } = require('./util');

/**
 * Get Transaction status
 * @param {phone, message} smsDetails 
 */
function getTransactionStatus(token, refCode, onePipeRequestPayload) {
    const requestHeaders = {
        headers: { 
            Authorization: token,
        }
    };

    const apiLoggerRequest = {
        ...onePipeRequestPayload,
        body: {},
        headers: requestHeaders,
        transaction_time: now().toISOString(),
        destination_url: `${config.payant_base_url}/transactions`,
        request_description: "Get Transtaction Status"
    }

    return axios.get(`${config.payant_base_url}/transactions/${refCode}`, requestHeaders)
    .then(async (response) => {
        await apiLogger(mapAPILogger(apiLoggerRequest, response));
        return response.data;
    })
    .catch(function (err) {
        logger.error(`Error verifying transaction status: ${err.message}`);
        throw err;
    })
}

/**
 * Authenticate flex user
 * @param {string} password 
 * @param {string} username 
 */
function authenticate(password, username) {
    const requestHeaders = {
        headers: {}
    };
    requestHeaders.headers['Content-Type'] = 'application/json';
    authDetails = {
        phone: username,
        password: password
    };
    return axios.post(`${config.payant_base_url}${CONSTANTS.URL_PATHS.authenticate}`, authDetails, requestHeaders)
    .then(response => response.data)
    .catch(function (err) {
        logger.error(`Error occurred on authenticating user: ${err.message}`);
        throw err;
    })
}

/**
 * Fetch list of provider services
 * @param {String} token 
 */
function listServiceProductsAPI(token, billerId, account, onePipeRequestPayload) {
    const uniqueAccount = (account) ? account : "";
    const requestHeaders = {
        headers: {
            Authorization: token
        }
    };

    const apiLoggerRequest = {
        ...onePipeRequestPayload,
        body: {account: uniqueAccount},
        headers: requestHeaders,
        transaction_time: now().toISOString(),
        destination_url: `${config.payant_base_url}${CONSTANTS.URL_PATHS.list_services_products}/${billerId}/products`,
        request_description: "Product Listing"
    }

    requestHeaders.headers['Content-Type'] = 'application/json';
     
    return axios.post(`${config.payant_base_url}${CONSTANTS.URL_PATHS.list_services_products}/${billerId}/products`, { account: uniqueAccount }, requestHeaders)
    .then(async (response) => {
        await apiLogger(mapAPILogger(apiLoggerRequest, response));
        return response.data;
    })
    .catch(function (err) {
        logger.error(`Error occurred on authenticating user: ${err.message}`);
        throw err;
    });
}

/**
 * Send request to purchase airtime
 * @param {string} token 
 * @param {string} url_path 
 * @param {object} payantRequestPayload
 * @param {object} onePipeRequestPayload 
 */
function payantServiceApiCall(token, url_path, payantRequestPayload, onePipeRequestPayload, callback) {
    const requestHeaders = {
        headers: {
            Authorization: token
        }
    };
    requestHeaders.headers['Content-Type'] = 'application/json';

    const apiLoggerRequest = {
        ...onePipeRequestPayload,
        body: payantRequestPayload,
        headers: requestHeaders,
        transaction_time: now().toISOString(),
        destination_url: `${config.payant_base_url}${url_path}`,
        request_description: "Payment"
    }

    return axios.post(`${config.payant_base_url}${url_path}`, payantRequestPayload, requestHeaders)
    .then(async (response) => {
        await apiLogger(mapAPILogger(apiLoggerRequest, response));
        return (typeof callback !== 'undefined') ? callback(response.data) : response.data}
    )
    .catch(async function (err) {
        err.response = {
            status: 'failed',
            statusText: err.message,
            headers: [],
            data: null
        };
        await apiLogger(mapAPILogger(apiLoggerRequest, err.response));
        logger.error(`Error occurred on payant service call: ${err.message}`);
        throw err;
    })
}

/**
 * Send request to purchase airtime
 * @param {object} payantRequestPayload 
 * @param {object} onePipeRequestPayload
 */
function payantIdentityApiCall(payantRequestPayload, onePipeRequestPayload) {
    const requestHeaders = {
        headers: {
            Authorization: `Bearer ${payantRequestPayload.secretKey}`
        }
    };
    requestHeaders.headers['Content-Type'] = 'application/json';
    const apiLoggerRequest = {
        ...onePipeRequestPayload,
        body: payantRequestPayload,
        headers: requestHeaders,
        transaction_time: now().toISOString(),
        destination_url: `${config.payant_identity_verification_base_url}/verification`,
        request_description: "NIN Call to Payant"
    };
    return axios.post(`${config.payant_identity_verification_base_url}/verification`, payantRequestPayload, requestHeaders)
    .then(async (response) => {
        //Clear Long Base64 string for image data
        response.data.data.photo = "";
        response.data.data.signature = "";
        await apiLogger(mapAPILogger(apiLoggerRequest, response));
        return response.data
    })
    .catch(async function (err) {
        err.response.data = null;
        await apiLogger(mapAPILogger(apiLoggerRequest, err.response));
        logger.error(`Error occurred on payant identity call: ${err.message}`);
        throw err;
    })
}

/**
 * Log api data
 * @param {*} logData 
 */
function apiLogger(logData) {
    const requestHeaders = {
        headers: {
            Authorization: `Bearer ${config.api_logger_bearer_token}`
        }
    }
    requestHeaders.headers['Content-Type'] = 'application/json';
    return axios.post(`${config.api_logger_url}`, logData, requestHeaders)
    .then(response => {
        logger.info(`Api logger status: ${(response.status == 200) ? 'Successful' : 'Failed'}`);
        return response.data;
    })
    .catch(function (err) {
        logger.error(`Error occurred on api log attempt: ${err.message}`);
        throw err;
    });
}

/**
 * Send otp to provided number
 * @param {object} smsDetails 
 */
function sendOTP(smsDetails) {
    const requestHeaders = {
        headers: { 
            Authorization: `Bearer ${config.one_pipe_sms_auth}`,
        }
    };

    return axios.post(config.one_pipe_sms_url, smsDetails, requestHeaders)
    .then(response => response.data)
    .catch(function (error) {
        throw error;
    })
}

module.exports = { 
    getTransactionStatus,
    authenticate,
    listServiceProductsAPI,
    payantServiceApiCall,
    sendOTP,
    payantIdentityApiCall,
    apiLogger
}