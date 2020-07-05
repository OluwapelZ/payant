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
        route_mode: 'transact'
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

const optionsProviderResponse = {
    "status": "success",
    "message": "Successful",
    "data": {
        "_id": "17",
        "name": "Spectranet",
        "_service": {
            "_id": "5",
            "name": "Data",
            "url": "/bills/pay/data"
        },
        "vendor": "airvend",
        "vendor_identifier": "spectranet",
        "type": "",
        "product": "Spectranet",
        "productCategories": [
            {
                "bundleCode": "500",
                "code": "500",
                "name": "N500 Bundle",
                "amount": 500,
                "quantity": "1"
            },
            {
                "bundleCode": "1000",
                "code": "1000",
                "name": "N1000 Bundle",
                "amount": 1000,
                "quantity": "1"
            },
            {
                "bundleCode": "2000",
                "code": "2000",
                "name": "N2000 Bundle",
                "amount": 2000,
                "quantity": "1"
            },
            {
                "bundleCode": "5000",
                "code": "5000",
                "name": "N5000 Bundle",
                "amount": 5000,
                "quantity": "1"
            },
            {
                "bundleCode": "7000",
                "code": "7000",
                "name": "N7000 Bundle",
                "amount": 7000,
                "quantity": "1"
            },
            {
                "bundleCode": "10000",
                "code": "10000",
                "name": "N10000 Bundle",
                "amount": 10000,
                "quantity": "1"
            }
        ]
    }
}

const encryptedValidData = 'J1CZYQ431h/q3yFYXqrQIggn16+ldVnBizP7jSJt37CRWlZKkaktIzTPmoA7L9TzOOxcYXcZ/z/DalWz+SIO4A4Wn20i6Upg5S9a7l/89g6bdFboDzjkPlIsdzKeeJBqs7qRfzT6BngtjTW/R9VsqPlyMFLztMbjKAbL7gLh5oM0gurL3h6c8PkwZQnh1drVLU4pxn6XQvOK40WV+lObewD3bHeVsbhy2in/TtH6XkWSm39K1xIEcVF2unwfbkgB6l4rM6TVKuF0Twe/J9tXXi6ADob6jQ19/u90SyUTIweJmVmEHy4CxdLhEAGznwu8x3tKGLL2bSaQ4XpGsvQ4lG9AaXc+wnU+AJtTaecbFR621elcF1WMhwUCgYnSvFAf/eaAlvlOIgOIgdZT2lR3QiIGKTTnBICIsatCMfJILpdEdlVksk6FBm8YPRvWkSvOel8ClXWvU85g3ZV17jR9oHZJQGMnXRR/svkh1H8mh3r4AopT7CHQKMvyTLqV+mUFMeKKaGcnCj4O9wAMH3Gbkk7MUZnoH4m3WXV5fLCKOTiMZskLS5Fo01HsJkuYSGWaIjAsDKwSM++L0PEF0mkkDa6NFLUqfI3CVD+UM7L1W9072f2cSiTcrnbLIhnncBf3lgRrs58uSG4l+HFrSlXmOd7l2mIHwlNExj/c/7MASPI2enkI1WoFZy8w8DetP090uKi9NeKfFg6CqDMgJm7ri+Te7DvIEeeu/e7e+Fl7RNFcbJ832gakVqwPB7iwoNUz5g/rObxukPRzRR3WKeDIv9EQKCglS/RS/JASwdd5J9CxutjCL6zyjpZnuGETb9yQqTd9KrqjQDoyYevvv6I6a2GxwCpC0dwFd88rRK1+pjSIJG0MO5RXv2FfWrGFXcXERf9aKmcofL0gM7wdMGKVL7KgGgDETyzVc+FZmALftQbZBe5gxukX7khsBMtBnlQTYtL6ubP9LLUcPF090fKA4rEbc/herbeE45LgllE8Xf1Lpcp2IGq3HWPYKRQu4h/XAzqC0fDSaEnYV0OrwFvogF+48pBxeeJf0Mvb4TdoajJ8mHtz6iXmcX6Y2wjI3grvBpOL2cuMEM6eDWpeDqXyGaDRgOweh6IoCirSa4QQcG2eGXsYptY3eIj/dXBadkY5QCARm5Bo4mMYWpWNDvrUZoJeMPm01P+TLWH1ZVtq05BATQoMtyc9QiHTSWbYRn8hjlI02mLTM6o+zSAWHjEmSl7dXsNV3JtwfRFiTMvX+2VL914OB8vrOLR4RnyA7TUMFovLokxIRMXSfirgMQSWjByrgP6rc0B4xSDk5q8thmjulRTpapAbC2mRZ+amReCF2y/QL15S2xqdQX+Wm6fWHNB/QLnPM0b0YBKGns6s1BEgAbTIK/e+G3nQ2fwlpteVb0KMYS0reDK6tWKjbXeM6Uy/QMClViTlX7kcMLVrb8WPZDMzsy+at7y8o8CRWhJMb6XFnVPC9WMcWgp2nAx1k2krdjnSszofwT38ZoxtmTSFMUPuaJ6ss0ZVFa+tHLZ5zYsCaR3yN0BMOHL6y85ADo8zFCVGPXFDKruKqJmJUwigSLOv4pWEq5VKhRVXp8rF/ulFNAHIVj9aBm/EGjz0TJQl5Igc4s/Ept9ylzsruN0/cnQeGCbQKPd6fFnvPdL/2UCYgMUoPhZokwj01lK5+4Po0kUZ0kMAlmIZDBR0la22QwNS4l3K+6CD0EmDrjViq1s4lQPN7/Z9VLPurrxsqE4JoBjNX6SO';
const emptyAuthSecureData = 'J1CZYQ431h/q3yFYXqrQIggn16+ldVnBizP7jSJt37CRWlZKkaktIzTPmoA7L9TzOOxcYXcZ/z/DalWz+SIO4A4Wn20i6Upg5S9a7l/89g6bdFboDzjkPljX5VrFGZZo5G9hBlXPT8pfbCfSOB7BLPjVb5i9X9fBaWuSBWzwaU5z2+OavaEzRDgGTVYI8bB2d00Sc+umcRBkdVn6XR3kLxRE64V8gWmVcMCsWe4sNySB0h6fzfEkXwZ32aEna29ozD/jUItJpEm8y8BaYDt0RGhzX9/fWNdnxiwG0AtNwW63Crf989JUyhk7b/j5RTR9AWAd04pM1ldly54rO/BXfOVdVjrN2/IP/hvrczsEFwXzdqbh+bCNedBLU3MxEkkpavWrKOY+N1/RF11naEwX7sPoVMlupaQPUUuK6wB3w4RIiYaSvIaFXXqbXabaPBxUu/ltZBhWgHNF0QF58zOj3A9tOntTZXY4p1ACHzsktoo/JyKyYujoYvTLTQkkweZ4nh5srakeqPXlWKaiKM/3vvYdRTUC8Qu2dGxryKM67NLMaLIsXN3BBnm0eSq75Xj/7i1IJWot/DyMr+eRQvwFH7pcTS2WDoLsOpo4/G9pmZLAxrmvzCWHTobuwhvLDDbD1PQS2/5Y6TZoDm73Lojue9rACfGihoA035oioLrRdUFcql77RUX/bRNRT02/gDnRRgIb3bvlpZ7WN3yZmkF/sVul6B6R4qbCaqKCWB5tobg3Hz8KLkpI19QrnTC3rNDXxfKJ0C48TqQITj1pooB5zYPrkjxWKo1DwNhjaONIvU222m6kbHXQyRZA0KI09aFmiGS27o4bvLOv2RGXKDW4DRrZZQ1k+is56goKyobS92AC7/GLl7Uzx50vFuCNGkU0wv1NNquoKXJ2dMgAqAjb4Do6Bwy9lYWdUPyUsa35FsYQqehiHn265w4H6QWl1K/MujwucGnugePhZozkug9XCsSw4A3G1x0shy7enDvx0ERiUR+bUVDsjRROil94QlttfMiKwChWQ9rZGt/HLqkygAaK4ilJOM3zZpUloYZVuTRa8kmSwTIhyi8MHoUAZrcCt0kHLDOyFwjLDDCCuPdbbiSkdZhL+7Lw+TnBfrDIHTDEPTCa6U+ixWbOFh9WtgXF4PKx/Bhnu8cGmuorSa08tXWcVZrRZouG/qvFmQWXPzoyxHDCzFrhT48xsP91kSsyNXmijx7M8CzpG65gIy5oDde+2IiV0qB6mSobG2S2shLJ17Oc+fB3w+AHEThGWkJCKv9pLFNdqx1PTy1dRBFXjighk0ZdCTc4TO5B/TmyF/HJCFSE8MFpsylx75uewwM+RR+Wn1gRtH8K59BFsCczBAYjxe1nBP9Kzj+0xBXVtljBdkihtbGQkJEyH7UVYmCIw1RRykxdFquiElVfJatPzTZs0eoQOCw3ajPRXdDvqnOIqj5lqGfRei2dy6cQxWgkvJif1kmptXcyXsiKAuppTqo852MYCvHHTLQgD1IynPxGjnRJ3Ots1i4kqYc1rcpW65ESWRGxp7JUNLARWh4NTDO7ZCzJnLWYMxq0anuy3rfPhCLuVvPiO19K2d4OstK6EGsm4a8uMfi8SE+uCrETiYVYtIpW0b+NJPWTUjM4JjUaTuJi9neDKvD+BOX9QXEx5vO5xEjdn+hiadC24EELUyzz9xgI7/3R/WDh8wQ9RB6Uh6+WADKURaOrdUapymf5HewfWU/w5GXxSZAv061b0sqh1YmTNbbS';
const emptyInvalidAuthData = 'J1CZYQ431h/q3yFYXqrQIggn16+ldVnBizP7jSJt37CRWlZKkaktIzTPmoA7L9TzOOxcYXcZ/z/DalWz+SIO4A4Wn20i6Upg5S9a7l/89g6bdFboDzjkPljX5VrFGZZo5G9hBlXPT8pfbCfSOB7BLPjVb5i9X9fBaWuSBWzwaU5z2+OavaEzRDgGTVYI8bB2d00Sc+umcRBkdVn6XR3kLxRE64V8gWmVcMCsWe4sNySB0h6fzfEkXwZ32aEna29ozD/jUItJpEm8y8BaYDt0RGhzX9/fWNdnxiwG0AtNwW63Crf989JUyhk7b/j5RTR9AWAd04pM1ldly54rO/BXfOVdVjrN2/IP/hvrczsEFwXzdqbh+bCNedBLU3MxEkkpavWrKOY+N1/RF11naEwX7sPoVMlupaQPUUuK6wB3w4RIiYaSvIaFXXqbXabaPBxUu/ltZBhWgHNF0QF58zOj3A9tOntTZXY4p1ACHzsktoo/JyKyYujoYvTLTQkkweZ4nh5srakeqPXlWKaiKM/3vvYdRTUC8Qu2dGxryKM67NLMaLIsXN3BBnm0eSq75Xj/7i1IJWot/DyMr+eRQvwFH7pcTS2WDoLsOpo4/G9pmZLAxrmvzCWHTobuwhvLDDbD1PQS2/5Y6TZoDm73Lojue9rACfGihoA035oioLrRdUFcql77RUX/bRNRT02/gDnRRgIb3bvlpZ7WN3yZmkF/sVul6B6R4qbCaqKCWB5tobg3Hz8KLkpI19QrnTC3rNDXxfKJ0C48TqQITj1pooB5zYPrkjxWKo1DwNhjaONIvU222m6kbHXQyRZA0KI09aFmiGS27o4bvLOv2RGXKDW4DRrZZQ1k+is56goKyobS92AC7/GLl7Uzx50vFuCNGkU0wv1NNquoKXJ2dMgAqAjb4Do6Bwy9lYWdUPyUsa35FsYQqehiHn265w4H6QWl1K/MujwucGnugePhZozkug9XCsSw4A3G1x0shy7enDvx0ERiUR+bUVDsjRROil94QlttfMiKwChWQ9rZGt/HLqkygAaK4ilJOM3zZpUloYZVuTRa8kmSwTIhyi8MHoUAZrcCt0kHLDOyFwjLDDCCuPdbbiSkdZhL+7Lw+TnBfrDIHTDEPTCa6U+ixWbOFh9WtgXF4PKx/Bhnu8cGmuorSa08tXWcVZrRZouG/qvFmQWXPzoyxHDCzFrhT48xsP91kSsyNXmijx7M8CzpG65gIy5oDde+2IiV0qB6mSobG2S2shLJ17Oc+fB3w+AHEThGWkJCKv9pLFNdqx1PTy1dRBFXjighk0ZdCTc4TO5B/TmyF/HJCFSE8MFpsylx75uewwM+RR+Wn1gRtH8K59BFsCczBAYjxe1nBP9Kzj+0xBXVtljBdkihtbGQkJEyH7UVYmCIw1RRykxdFquiElVfJatPzTZs0eoQOCw3ajPRXdDvqnOIqj5lqGfRei2dy6cQxWgkvJif1kmptXcyXsiKAuppTqo852MYCvHHTLQgD1IynPxGjnRJ3Ots1i4kqYc1rcpW65ESWRGxp7JUNLARWh4NTDO7ZCzJnLWYMxq0anuy3rfPhCLuVvPiO19K2d4OstK6EGsm4a8uMfi8SE+uCrETiYVYtIpW0b+NJPWTUjM4JjUaTuJi9neDKvD+BOX9QXEx4+8W6AvaE0wQCB/07UVkvNrzXlaWs+4J0xxDuV9cNzqilTQvux72QzDwpUvM6+P727sDxKylaYM=';

const authenticateToken = '23jlijiojoijlijlkwlkjlsjfijsojifjsijfesjosjf';

module.exports = { req, res, rawData, invalidData, encryptedValidData, emptyAuthSecureData, emptyInvalidAuthData, authenticateToken, optionsProviderResponse }