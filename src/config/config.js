const config = {
    payant_base_url: process.env.PAYANT_BASE_URL,
    payant_service_list: process.env.LIST_SERVICES_URL,
    auth: {
        username: process.env.BASIC_AUTH_USERNAME,
        password: process.env.BASIC_AUTH_PASSWORD
    },
    one_pipe_sms_auth: process.env.ONE_PIPE_SMS_AUTH,
    crypt_key: process.env.CRYPT_KEY,
    provider_name: process.env.PROVIDER_NAME
}

module.exports = config