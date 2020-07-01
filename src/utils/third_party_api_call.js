const axios = require('axios');
const config = require('../config/config');
const CONSTANTS = require('../constants/constant');
const logger = require('./logger');

/**
 * Send otp to user with user with abstract argument
 * @param {phone, message} smsDetails 
 */
function sendOTP(smsDetails) {
    const requestHeaders = {
        headers: { 
            Authorization: `Bearer ${config.one_pipe_sms_url}`,
        }
    };

    return axios.post(config.one_pipe_sms_url, smsDetails, requestHeaders)
    .then(response => response.data)
    .catch(function (err) {
        console.log(err);
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
 * @param {string} amount 
 * @param {string} phoneNumber 
 */
function payantServiceApiCall(token, url_path, data) {
    const requestHeaders = {
        headers: {
            Authorization: token
        }
    };
    requestHeaders.headers['Content-Type'] = 'application/json';

    return axios.post(`${config.payant_base_url}${url_path}`, data, requestHeaders)
    .then(response => response.data)
    .catch(function (err) {
        logger.error(`Error occurred on purchasing airtime: ${err.message}`);
        throw err;
    })
}

module.exports = { 
    sendOTP,
    authenticate,
    listServiceProductsAPI,
    payantServiceApiCall
}