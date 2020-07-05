const axios = require('axios');
const config = require('../config/config');
const CONSTANTS = require('../constants/constant');
const logger = require('./logger');

/**
 * Get Transaction status
 * @param {phone, message} smsDetails 
 */
function getTransactionStatus(token, refCode) {
    const requestHeaders = {
        headers: { 
            Authorization: token,
        }
    };

    return axios.get(`${config.payant_base_url}/transactions/${refCode}`, requestHeaders)
    .then(response => response.data)
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
function listServiceProductsAPI(token, billerId) {
    const requestHeaders = {
        headers: {
            Authorization: token
        }
    };
    requestHeaders.headers['Content-Type'] = 'application/json';
     
    return axios.post(`${config.payant_base_url}${CONSTANTS.URL_PATHS.list_services_products}/${billerId}/products`, {}, requestHeaders)
    .then(response => response.data)
    .catch(function (err) {
        logger.error(`Error occurred on authenticating user: ${err.message}`);
        throw err;
    });
}

/**
 * Send request to purchase airtime
 * @param {string} token 
 * @param {string} url_path 
 * @param {object} requestPayload 
 */
function payantServiceApiCall(token, url_path, requestPayload, callback) {
    const requestHeaders = {
        headers: {
            Authorization: token
        }
    };
    requestHeaders.headers['Content-Type'] = 'application/json';

    return axios.post(`${config.payant_base_url}${url_path}`, requestPayload, requestHeaders)
    .then(response => (typeof callback !== 'undefined') ? callback(response.data) : response.data)
    .catch(function (err) {
        logger.error(`Error occurred on purchasing airtime: ${err.message}`);
        throw err;
    })
}

/**
 * Send request to purchase airtime
 * @param {object} requestPayload 
 */
function payantIdentityApiCall(requestPayload) {
    const requestHeaders = {
        headers: {
            Authorization: `Bearer ${config.payant_identity_api_key}`
        }
    };
    requestHeaders.headers['Content-Type'] = 'application/json';

    return axios.post(`${config.payant_identity_verification_base_url}/verification`, requestPayload, requestHeaders)
    .then(response => response.data)
    .catch(function (err) {
        logger.error(`Error occurred on purchasing airtime: ${err.message}`);
        throw err;
    })
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
        console.log(errror);
        throw error;
    })
}

module.exports = { 
    getTransactionStatus,
    authenticate,
    listServiceProductsAPI,
    payantServiceApiCall,
    sendOTP,
    payantIdentityApiCall
}