const { failed } = require('../utils/http_response');
const ResponseMessages = require('../constants/response_messages');
const CONSTANTS = require('../constants/constant');
const logger = require('../utils/logger');
const { decryptData } = require('../utils/crypt');
const { authenticate } = require('../utils/third_party_api_call');

async function authenticatePayantUser(req, res, next) {
    try {
        const requestPayload = decryptData(req.body.data);
        req.body.data = requestPayload;
        
        if (!CONSTANTS.MOCK_MODES.ALL.includes((requestPayload.transaction.mock_mode).toLowerCase())) {
            logger.error('Mock mode must be provided for any request to payant: [inspect or live]');
            return failed(res, 401, ResponseMessages.INVALID_MOCK_MODE_ERROR);
        }

        if ((requestPayload.transaction.mock_mode).toLowerCase() == CONSTANTS.MOCK_MODES.INSPECT && requestPayload.auth.route_mode != CONSTANTS.REQUEST_TYPES.QUERY) {
            return next();
        }

        // Exclude otp validation request from payant authentication.
        if (requestPayload.auth.route_mode == CONSTANTS.REQUEST_TYPES.VALIDATE) {
            return next();
        }

        if ((requestPayload.auth && requestPayload.auth.secure == ';') && (!requestPayload.transaction.app_info || !requestPayload.transaction.app_info.extras || requestPayload.transaction.app_info.extras.phone_number == '')) {
            logger.error('Invalid authentication details - No authentication detail');
            return failed(res, 401, ResponseMessages.NO_AUTH_DETAILS_PROVIDED);
        }

        const authResponse = await authUser(requestPayload);
        if (!authResponse) {
            return failed(res, 401, ResponseMessages.AUTHENICATION_FAILED);
        }

        req.body.token = authResponse.token;
        next();
    } catch (err) {
        logger.error(`Internal Server Error on authentication attempt: ${err}`);
        failed(res, 500, err.message, err.stack);
        throw err;
    }
}

async function authUser(requestPayload) {
    let username = '';
    let password = '';
    if (requestPayload.auth && requestPayload.auth.secure && requestPayload.auth.secure != '') {
        username = requestPayload.auth.secure.split(';')[0];
        password = requestPayload.auth.secure.split(';')[1];
    } else if(requestPayload.transaction.app_info.extras.allow_wallet_override=="true" || requestPayload.request_mode==CONSTANTS.REQUEST_TYPES.QUERY) {
            username = requestPayload.transaction.app_info.extras.phone_number;
            password = requestPayload.transaction.app_info.extras.password;
    }
    else{
        logger.error('Invalid authentication details - Unauthorized user');
        return null;
    }

    const authResponse = await authenticate(password, username);
    if (authResponse.status == CONSTANTS.PAYANT_STATUS_TYPES.error) {
        logger.error('Invalid authentication details - Unauthorized user');
        return null;
    }

    logger.info('Successfully authenticated user');
    return authResponse;
}

module.exports = {
    authenticatePayantUser,
    authUser
}