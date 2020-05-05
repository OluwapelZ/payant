const axios = require('axios');
const config = require('../config/config');
const CONSTANTS = require('../config/constant');
const logger = require('./logger');

function sendOTP(smsDetails) {
    const requestHeaders = {
        headers: { 
            Authorization: `Bearer ${config.one_pipe_sms_url}`,
        }
    };

    return axios.post(config.one_pipe_sms_url, smsDetails, requestHeaders)
    .then(response => response.data)
    .catch(function (error) {
        console.log(errror);
        throw error;
    })
}

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
    .catch(function (error) {
        logger.error(`Error occurred on authenticating user: ${error.message}`);
        throw error;
    })
}

function listProviderServicesAPI(token) {
    const requestHeaders = {
        headers: {
            Authorization: token
        }
    };
    requestHeaders.headers['Content-Type'] = 'application/json';

    return axios.get(`${config.payant_base_url}${CONSTANTS.URL_PATHS.list_services}`, requestHeaders)
    .then(response => response.data)
    .catch(function (error) {
        logger.error(`Error occurred on authenticating user: ${error.message}`);
        throw error;
    })
}

module.exports = { sendOTP, authenticate, listProviderServicesAPI }