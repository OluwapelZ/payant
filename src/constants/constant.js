const CONSTANTS = {
    REQUEST_STATUSES: {
        SUCCESSFUL: 'Successful',
        FAILED: 'Error',
        WAITING_FOR_OTP: 'WaitingForOTP',
        OPTIONS_DELIVERED: 'OptionsDelivered',
    },
    REQUEST_TYPES: {
        TRANSACT: 'transact',
        OPTIONS: 'options',
        VALIDATE: 'validate',
        QUERY: 'query',
        PAY_TV: 'pay_tv',
        PAY_ELECTRICITY: 'pay_electricity',
        NIN_MID: 'lookup_nin_mid',
        NIN_MIN: 'lookup_nin_min',
        BUY_AIRTIME: 'buy_airtime',
        BUY_DATA: 'buy_data',
        BUY_SCRATCH_CARD: 'buy_scratch_card'
    },
    STATUS_CODES: {
        SUCCESS: 200,
        FAILED: 500,
        WAITING_FOR_OTP: 200,
        WRONG_AUTH_PROVIDE: 400
    },
    URL_PATHS: {
        authenticate: '/users/account/authenticate',
        list_services_products: '/services/category',
        airtime: '/bills/pay/airtime',
        data: '/bills/pay/data',
        buy_scratch_card: '/bills/pay/scratch-card',
        buy_electricity: '/bills/pay/electricity',
        buy_tv: '/bills/pay/tv',
        look_up_nin: '/verification',
        verify: 'verify'
    },
    PAYANT_STATUS_TYPES: {
        successful: 'success',
        error: 'error',
        pending: 'pending'
    },
    SERVICE_CATEGORY_ID: {
        BUY_AIRTIME: 7,
        BUY_DATA: 30,
    },
    SERVICE_STATUS_URL: {
        BUY_AIRTIME: "http://api.mydomain.com/airtime_callback"
    },
    INVOICE_PERIOD: 1,
}

module.exports = CONSTANTS;