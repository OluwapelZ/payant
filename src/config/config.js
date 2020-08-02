const config = {
    payant_base_url: process.env.PAYANT_BASE_URL,
    payant_identity_verification_base_url: process.env.IDENTITY_BASE_URL,
    payant_service_list: process.env.LIST_SERVICES_URL,
    payant_identity_api_key: process.env.IDENTITY_API_KEY,
    api_logger_url: process.env.API_LOGGER_URL,
    api_logger_bearer_token: process.env.API_LOGGER_TOKEN,
    one_pipe_sms_url: process.env.ONE_PIPE_SMS_URL,
    auth: {
        username: process.env.BASIC_AUTH_USERNAME,
        password: process.env.BASIC_AUTH_PASSWORD,
        one_pipe_sms_auth: process.env.ONE_PIPE_SMS_AUTH,
    },
    one_pipe_sms_auth: process.env.ONE_PIPE_SMS_AUTH,
    crypt_key: process.env.CRYPT_KEY || 'p@hy@ernt',
    provider_name: process.env.PROVIDER_NAME,
    mysql: {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
    },
    service_ids: {
        buy_airtime: process.env.AIRTIME,
        pay_electricity: process.env.ELECTRICITY,
        buy_data: process.env.DATA_SUB,
        pay_tv: process.env.TV_SUB,
        buy_scratch_card: process.env.EDUCATION,
    },
    service_biller_ids: {
        buy_airtime: {
            aritel: process.env.AIRTEL,
            mtn: process.env.MTN,
            Glo: process.env.GLO,
            "9mobile": process.env.NINE_MOBILE,
        },
        pay_electricity: {
            IBEDCPR: process.env.IBADAN_PREPAID,
            IBEDCPP: process.env.IBADAN_POSTPAID,
            KEDCPR: process.env.KADUNA_PREPAID,
            EKEDCPP: process.env.EKO_POSTPAID,
            EKEDCPR: process.env.EKO_PREPAID,
            IKEDCPP: process.env.IKEJA_POSTPAID,
            IKEDCPR: process.env.IKEJA_PREPAID,
            AEDC: process.env.ABUJA_PREPAID,
            JEDCPR: process.env.JOS_PREPAID,
            EEDCPP: process.env.ENUGU_POSTPAID,
            EEDCPR: process.env.ENUGU_PREPAID,
        },
        buy_data: {
            Smile: process.env.SMILE,
            MTN: process.env.MTN_DATA,
            Spectranet: process.env.SPECTRANET,
            "9mobile": process.env.NINE_MOBILE_DATA,
            Airtel: process.env.AIRTEL_DATA,
        },
        pay_tv: {
            gotv: process.env.GOTV || 15,
            startimes: process.env.STARTIMES || 16,
            dstv: process.env.DSTV || 14,
        },
        buy_scratch_card: {
            waec_scratch_card: process.env.WAEC_SCRATH_CARD,
        },
    },
}

module.exports = config