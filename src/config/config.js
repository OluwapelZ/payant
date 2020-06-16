const config = {
    payant_base_url: process.env.PAYANT_BASE_URL,
    payant_service_list: process.env.LIST_SERVICES_URL,
    auth: {
        username: process.env.BASIC_AUTH_USERNAME,
        password: process.env.BASIC_AUTH_PASSWORD
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
            glo: process.env.GLO,
            nine_mobile: process.env.NINE_MOBILE,
        },
        pay_electricity: {
            ibadan_prepaid: process.env.IBADAN_PREPAID,
            ibadan_postpaid: process.env.IBADAN_POSTPAID,
            ph_postpaid: process.env.PH_POSTPAID,
            ph_prepaid: process.env.PH_PREPAID,
            kaduna_prepaid: process.env.KADUNA_PREPAID,
            eko_postpaid: process.env.EKO_POSTPAID,
            eko_prepaid: process.env.EKO_PREPAID,
            ikeja_postpaid: process.env.IKEJA_POSTPAID,
            ikeja_prepaid: process.env.IKEJA_PREPAID,
            abuja_prepaid: process.env.ABUJA_PREPAID,
            job_prepaid: process.env.JOS_PREPAID,
            kano_prepaid: process.env.KANO_PREPAID,
            enugu_postpaid: process.env.ENUGU_POSTPAID,
            enugu_prepaid: process.env.ENUGU_PREPAID,
        },
        buy_data: {
            smile: process.env.SMILE,
            mtn_data: process.env.MTN_DATA,
            spectranet: process.env.SPECTRANET,
            nine_mobile_data: process.env.NINE_MOBILE_DATA,
            airtel_data: process.env.AIRTEL_DATA,
        },
        pay_tv: {
            gotv: process.env.GOTV,
            startimes: process.env.STARTIMES,
            dstv: process.env.DSTV,
        },
        buy_scratch_card: {
            waec_scratch_card: process.env.WAEC_SCRATH_CARD,
        },
    },
}

module.exports = config