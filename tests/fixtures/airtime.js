const req = {
    body: {},
    cookies: {},
    query: {},
    params: {},
};

const res = {
    clearCookie: {},
    cookie: {},
    download: {},
    end: {},
    format: {},
    json: {},
    jsonp: {},
    redirect: {},
    render: {},
    send: {},
    sendFile: {},
    sendStatus: {},
    set: {},
    type: {},
    status: jest.fn().mockImplementation(() => {
        return {
            send: jest.fn()
        }
    })
};

const rawData = {
    "request_ref":"{{request-ref}}", 
    "request_type":"buy_data",
    "auth": {
        "type": "wallet", 
        "secure": "+2348022221412;p455.p455",
        "auth_provider": "Payant",
        "route_mode": "options"
    },
    "transaction": {
        "mock_mode": "live", 
        "transaction_ref": "{{transaction-ref}}", 
        "transaction_desc": "A random transaction", 
        "transaction_ref_parent": "", 
        "amount": 10000,
        "customer":{
            "customer_ref": "{{customer id}}",
            "firstname": "Oluwapelumi",
            "surname": "Olaoye",
            "email": "olaoy*********@gmail.com",
            "mobile_no": "234802343132"
        },
        "meta":{
            "a_key":"a_meta_value_1",
            "another_key":"a_meta_value_2"
        },
        "details": {
            "biller_id": "Smiles"
        },
        "client_info": {
            "name": "TrustPay",
            "id": null,
            "bank_cbn_code": null,
            "bank_name": null,
            "console_url": null,
            "js_background_image": null,
            "css_url": null,
            "logo_url": "https://trustpay.onepipe.io/img/trustpay_logo_console.png",
            "footer_text": "Brought to you by <strong>SunTrust Bank</strong>",
            "options": [
                "BANK.TRANSFER",
                "CARD"
            ],
            "primary_color": "#b37038",
            "secondary_color": "#b37038",
            "primary_button_color": "#b37038",
            "modal_background_color": "linear-gradient(147.44deg, #d8903c 26.99%, #e69921 74.1%)",
            "payment_option_color": "rgba(76, 61, 47, 0.08)",
            "payment_option_active_color": "rgba(31, 31, 31, 0.25)",
            "app_color": "#b37038"
        },
        "app_info": {
            "name": "VictorMotors",
            "id": "5cdab3332b7d4100015f0db4",
            "beneficiary_account_no": "0001137069",
            "extras": {
                "phone_number":"",
                "password": "",
                "allow_wallet_override": true
            }
        }
    }
}

const invalidData = {
    request_ref:"{{request-ref}}", 
    request_type:"pay_tv",
    auth: {
        type: "wallet", 
        secure: ";",
        auth_provider: "Payant",
        route_mode: 'options'
    },
    transaction: {
        mock_mode: "live", 
        transaction_ref: "{{transaction-ref}}", 
        transaction_desc: "A random transaction", 
        transaction_ref_parent: "", 
        amount: 10000,
        customer:{
            customer_ref: "{{customer id}}",
            firstname: "Oluwapelumi",
            surname: "Olaoye",
            email: "olaoy*********@gmail.com",
            mobile_no: "234802343132"
        },
        meta:{
            a_key:"a_meta_value_1",
            another_key:"a_meta_value_2"
        },
        details: {
            telco_code: "Glo",
            order_reference: "check-again-now-223OU09809SF",
        },
        client_info: {
            name: "TrustPay",
            id: null,
            bank_cbn_code: null,
            bank_name: null,
            console_url: null,
            js_background_image: null,
            css_url: null,
            logo_url: "https://trustpay.onepipe.io/img/trustpay_logo_console.png",
            footer_text: "Brought to you by <strong>SunTrust Bank</strong>",
            options: [
                "BANK.TRANSFER",
                "CARD"
            ],
            primary_color: "#b37038",
            secondary_color: "#b37038",
            primary_button_color: "#b37038",
            modal_background_color: "linear-gradient(147.44deg, #d8903c 26.99%, #e69921 74.1%)",
            payment_option_color: "rgba(76, 61, 47, 0.08)",
            payment_option_active_color: "rgba(31, 31, 31, 0.25)",
            app_color: "#b37038"
        },
        app_info: {
            name: "VictorMotors",
            id: "5cdab3332b7d4100015f0db4",
            beneficiary_account_no: "0001137069",
            extras: {
                phone_number:"",
                password: "",
                allow_wallet_override: true
            }
        }
    }
};

const authenticateToken = '23jlijiojoijlijlkwlkjlsjfijsojifjsijfesjosjf';

module.exports = { req, res, rawData, invalidData, authenticateToken }