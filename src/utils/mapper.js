const CONSTANTS = require('../constants/constant');
const config = require('../config/config');
const { generateRandomReference, now, matchString } = require('../utils/util');

function mapErrorResponse(message, stack) {
    return {
        status: CONSTANTS.REQUEST_STATUSES.FAILED,
        message: message,
        data: {
            provider_response_code: null,
            provider: config.provider_name,
            errors: stack,
            error: message,
            provider_response: {
                reference: generateRandomReference()
            },
        }
    }
}

function mapWaitingForOTP(message, reference) {
    return {
        status: CONSTANTS.REQUEST_STATUSES.WAITING_FOR_OTP,
        message: message,
        data: {
            provider_response_code: "00",
            provider: "Payant",
            errors: null,
            error: null,
            provider_response: null,
            reference: reference
        }
    }
}

function mapServiceProducts(rawData, orderReference, transactionRef) {
    return {
        provider_response_code: '00',
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            products: mapProducts(rawData, orderReference),
        },
        reference: transactionRef,
        meta: {}
    };
}

function mapProducts(productsData, orderReference) {
    const productList = [];
    if (productsData.productCategories.length > 0) {
        productsData.productCategories.forEach(element => {
            productList.push(
                {
                    order_reference: orderReference,
                    biller_item_id: productsData._id,
                    biller_item_code: element.bundleCode,
                    biller_item_name: element.name,
                    biller_item_description: '',
                    biller_item_image_url: '',
                    biller_item_prompt: '',
                    customer_name: '',
                    biller_item_meta: {},
                    currency: '566',
                    amount: element.amount,
                    terms: null,
                    terms_url: null,
                }
            );
        });
    }

    return productList;
}

function mapTransactionDetails(reqRef, transactionRef, request, response, mappedResponse, requestMode, orderRef, isOrderRefActive, otp) {
    return {
        onepipeRequestRef: reqRef,
        onepipeTransactionRef: transactionRef,
        providerRequest: JSON.stringify(request),
        providerStatus: response.status,
        providerResponse: JSON.stringify(response),
        mappedResponse: JSON.stringify(mappedResponse),
        orderReference: orderRef,
        isOrderActive: isOrderRefActive,
        requestMode,
        otp
    }
}

function mapAirtimeResponse(responsePayload, amount, orderRef) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            payment_status: "Successful",
            fulfillment_status: "Processing",
            transaction_final_amount: (Number(amount) * 100), //In kobo
            transaction_fee: "0.00",
            narration: (responsePayload.text) ? responsePayload.text : "",
            reference: orderRef,
            "meta":{}
        }
    };
}

function mapDataResponse(responsePayload, amount, orderRef) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            payment_status: "Successful",
            fulfillment_status: "Processing",
            transaction_final_amount: (Number(amount) * 100), //In kobo
            transaction_fee: "0.00",
            narration: (responsePayload.text) ? responsePayload.text : "",
            reference: orderRef,
            "meta":{}
        }
    };
}

function mapElectricityResponse(responsePayload) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
        reference: generateRandomReference(),
        payment_status: "Successful",
        fulfillment_status: "Succesful",
        transaction_final_amount: responsePayload.amount,//in kobo
        transaction_fee: 0.00,
        pin_code: responsePayload.pin.pinCode,
        pin_serial_number: responsePayload.pin.serialNumber,
        narration: "Electricity subscription was successful"
        }
    };
}

function mapTvResponse(requestPayload, responsePayload) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            reference: requestPayload.transaction.transaction_ref,
            payment_status: responsePayload.transaction.status,
            fulfillment_status: responsePayload.status,
            transaction_final_amount: responsePayload.transaction.amount,
            transaction_fee: 0,
            narration: ""
        }
    };
}

function mapScratchCardResponse(responsePayload, orderReference) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            scratch_card_number: responsePayload.pin.serialNumber,
            sratch_card_pin: responsePayload.pin.pinCode,
            scratch_card_serial: responsePayload.pin.serialNumber,
            payment_status: "Successful",
            fulfillment_status: "Succesful",
            transaction_final_amount: responsePayload.amount,
            transaction_fee: 0,
            narration: "Waec Scratch card purchase was successful",
            reference: orderReference,
        }
    };
}

function mapMinNinResponse(identityResponse, orderReference, transactionRequestPayload) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            nin: identityResponse.data.nin,
            first_name: matchString(transactionRequestPayload.customer.firstname, identityResponse.data.firstname),
            middle_name: matchString(transactionRequestPayload.details.middle_name, identityResponse.data.middlename),
            last_name: matchString(transactionRequestPayload.customer.lastname, identityResponse.data.surname),
            dob: matchString(transactionRequestPayload.details.dob, identityResponse.data.birthdate),
            reference: orderReference,
            meta: {}
        }
    };
}

function mapMidNinResponse(identityResponse, orderReference) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            nin: identityResponse.data.nin,
            first_name: identityResponse.data.firstname,
            middle_name: identityResponse.data.middlename,
            last_name: identityResponse.data.surname,
            dob: identityResponse.data.birthdate,
            phone_number1: identityResponse.data.telephoneno,
            phone_number2: "",
            reference: orderReference,
            meta: {}
        }
    }
}

function mapAPILogger(request, response, body) {
    if (!request.transaction) {
        request.transaction = {
            client_info: {
                id: 'test-client-id',
                name: 'Test name'
            },
            app_info: {
            id: 'test-app-id',
            name: 'Test app information details'
            },
            transaction_ref: 'test_reference'
        }
    }
    return {
        platform: "Payant",
        client: {
            client_id: request.transaction.client_info.id,
            client_name: request.transaction.client_info.name,
            client_app_id: request.transaction.app_info.id,
            client_app_name: request.transaction.app_info.id,
        },
        transaction: {
            transaction_ref: request.transaction.transaction_ref,
            transaction_timestamp: now().toISOString()
        },
        request: {
            source_name: "onepipe payant integration",
            destination_name: "Payant",
            request_type: "service name",
            request_timestamp: now().toISOString(),
            request_description: "",
            destination_url: "",
            request_headers: JSON.stringify(request.headers),
            request_body: JSON.stringify(body)
        },
        response: {
            response_timestamp: now().toISOString(),
            response_http_status: response.status,
            response_code: response.statusCode,
            response_headers: JSON.stringify(response._headers),
            response_body: JSON.stringify(body)
        }
    }
}



module.exports = {
    mapErrorResponse,
    mapWaitingForOTP,
    mapServiceProducts,
    mapTransactionDetails,
    mapAirtimeResponse,
    mapDataResponse,
    mapMinNinResponse,
    mapMidNinResponse,
    mapElectricityResponse,
    mapTvResponse,
    mapScratchCardResponse,
    mapAPILogger
};