const mung = require('express-mung');
const { mapAPILogger } = require('../utils/mapper');
const { apiLogger } = require('../utils/third_party_api_call');

function redact(body, req, res) {
    const apiData = mapAPILogger(req, res, body);
    apiLogger(apiData);
    return;
}

module.exports = mung.json(redact)  