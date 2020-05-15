const { failed } = require('../utils/http_response');
const ResponseMessages = require('../config/response_messages');
const CONSTANTS = require('../config/constant');
const logger = require('../utils/logger');
const { decrypt, encrypt } = require('../utils/crypt');
const config = require('../config/config');
const { authenticate } = require('../utils/third_party_api_call');

module.exports = async (req, res, next) => {
    try {
        let rawData = decrypt(config.crypt_key, req.body.data);
        let trimmedDated = rawData.split("").filter(function(e) {
            return e != "\u0000" ;
        });
        rawData = trimmedDated.join('');

        let username = '';
        let password = '';

        const requestPayload = JSON.parse(rawData);
        if (requestPayload.auth && requestPayload.auth.secure != '') {
            username = requestPayload.auth.secure.split(';')[0];
            password = requestPayload.auth.secure.split(';')[1]
        } else if (requestPayload.app_info && requestPayload.app_info.extras) {
            username = requestPayload.app_info.extras.phone_number;
            password = requestPayload.app_info.extras.password;
        } else {
            logger.error('Invalid authentication details - Unauthorized user');
            failed(res, 401, ResponseMessages.NO_AUTH_DETAILS_PROVIDED);
        }

        const authResponse = await authenticate(password, username);
        if (authResponse.status == CONSTANTS.PAYANT_STATUS_TYPES.error) {
            logger.error('Invalid authentication details - Unauthorized user');
            failed(res, 401, ResponseMessages.AUTHENICATION_FAILED);
            return;
        }

        logger.info('Successfully authenticated user');
        req.body.data = requestPayload;
        req.body.token = authResponse.token;
        next();
    } catch (error) {
        logger.error(`Internal Server Error on authentication attempt: ${errror}`)
        failed(res, 500, error.message, error.stack)
    }
}