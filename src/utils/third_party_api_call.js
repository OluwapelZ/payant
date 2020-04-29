const axios = require('axios');
const config = require('../config/config');

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

module.exports = { sendOTP }