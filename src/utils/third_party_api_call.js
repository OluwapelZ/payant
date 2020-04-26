const axios = require('axios');
const config = require('../config/config');

function getLoanStatus(customerRef) {
    return axios.get(`${config.migo_base_url}/loans`, {
        auth: config.basic_auth,
        params: {
          clientNo: customerRef
        }
    })
    .then(response => {
        return response.data
    })
    .catch(function (error) {
        console.log(error.message);
        throw error
    })
}

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

module.exports = { getLoanStatus, sendOTP }