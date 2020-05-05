const CONSTANTS = {
    REQUEST_STATUSES: {
        SUCCESSFUL: 'Successful',
        FAILED: 'Failed',
        WAITING_FOR_OTP: 'WaitingForOTP'
    },
    REQUEST_TYPES: {
        TRANSACT: 'transact',
        VALIDATE: 'validate',
        QUERY: 'query'
    },
    STATUS_CODES: {
        SUCCESS: 200,
        FAILED: 500,
        WAITING_FOR_OTP: 200,
        WRONG_AUTH_PROVIDE: 400
    },
    URL_PATHS: {
        authenticate: '/users/account/authenticate',
        list_services: '/services'
    },
    PAYANT_STATUS_TYPES: {
        successful: '',
        error: 'error'
    }
}

module.exports = CONSTANTS;