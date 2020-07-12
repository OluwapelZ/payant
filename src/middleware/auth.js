const { failed } = require('../utils/http_response');
const ResponseMessages = require('../constants/response_messages');
const CONSTANTS = require('../constants/constant');
const logger = require('../utils/logger');
const { decrypt, encrypt } = require('../utils/crypt');
const config = require('../config/config');
const { authenticate } = require('../utils/third_party_api_call');

module.exports = async (req, res, next) => {
    try {
        let rawData = decrypt(config.crypt_key, req.body.data);
        let trimmedDated = rawData.split("").filter(function(e) {
            return e != "\u0000";
        });
        rawData = trimmedDated.join('');

        let username = '';
        let password = '';

        const requestPayload = JSON.parse(rawData);

        // Exclude otp validation request from payant authentication.
        if (requestPayload.auth.route_mode == CONSTANTS.REQUEST_TYPES.VALIDATE) {
            next();
        }

        if ((requestPayload.auth && requestPayload.auth.secure == ';') && (!requestPayload.transaction.app_info || !requestPayload.transaction.app_info.extras || requestPayload.transaction.app_info.extras.phone_number == '')) {
            logger.error('Invalid authentication details - No authentication detail');
            return failed(res, 401, ResponseMessages.NO_AUTH_DETAILS_PROVIDED);
        }

        if (requestPayload.auth && requestPayload.auth.secure != '') {
            username = requestPayload.auth.secure.split(';')[0];
            password = requestPayload.auth.secure.split(';')[1];
        } else {
            username = requestPayload.transaction.app_info.extras.phone_number;
            password = requestPayload.transaction.app_info.extras.password;
        }

        const authResponse = await authenticate(password, username);
        if (authResponse.status == CONSTANTS.PAYANT_STATUS_TYPES.error) {
            logger.error('Invalid authentication details - Unauthorized user');
            return failed(res, 401, ResponseMessages.AUTHENICATION_FAILED);
        }

        logger.info('Successfully authenticated user');
        req.body.data = requestPayload;
        req.body.token = authResponse.token;
        next();
    } catch (err) {
        logger.error(`Internal Server Error on authentication attempt: ${err}`)
        failed(res, 500, err.message, err.stack)
        throw err;
    }
}