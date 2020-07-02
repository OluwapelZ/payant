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
    .then(response => callback(response.data))
    .catch(function (err) {
        logger.error(`Error occurred on purchasing airtime: ${err.message}`);
        throw err;
    })
}

module.exports = { 
    getTransactionStatus,
    authenticate,
    listServiceProductsAPI,
    payantServiceApiCall
}