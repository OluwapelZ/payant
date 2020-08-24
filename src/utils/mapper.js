const CONSTANTS = require('../constants/constant');
const config = require('../config/config');
const { generateRandomReference, now, matchString } = require('../utils/util');

function mapErrorResponse(message) {
    return {
        status: CONSTANTS.REQUEST_STATUSES.FAILED,
        message: message,
        data: {
            provider_response_code: null,
            provider: config.provider_name,
            errors: [
                {
                    code: "01",
                    message: message
                }
            ],
            error: {
                code: "01",
                message: message
            },
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

function mapServiceProducts(rawData, orderReference, transactionRef, isMock=false) {
    return {
        provider_response_code: '00',
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            products: isMock ? [
                {
                    order_reference: "orderReference",
                    biller_item_id: "productsData._id",
                    biller_item_code: "element.bundleCode",
                    biller_item_name: "element.name",
                    biller_item_description: '',
                    biller_item_image_url: '',
                    biller_item_prompt: '',
                    customer_name: '',
                    biller_item_meta: {},
                    currency: '566',
                    amount: "element.amount",
                    terms: null,
                    terms_url: null,
                },
            ] : mapProducts(rawData, orderReference),
        },
        reference: isMock ? "mockReference" : transactionRef,
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

function mapAirtimeResponse(responsePayload, amount, orderRef, isMock=false) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            payment_status: "Successful",
            fulfillment_status: "Processing",
            transaction_final_amount: (isMock) ? "0.00" : (Number(amount) * 100), //In kobo
            transaction_fee: "0.00",
            narration: (isMock) ? " " : (responsePayload.text) ? responsePayload.text : "",
            reference: isMock ? "mockReference" : orderRef,
            "meta":{}
        }
    };
}

function mapDataResponse(responsePayload, amount, orderRef, isMock=false) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            payment_status: "Successful",
            fulfillment_status: "Processing",
            transaction_final_amount: (isMock) ? "0.00" : (Number(amount) * 100), //In kobo
            transaction_fee: "0.00",
            narration: (isMock) ? " " : (responsePayload.text) ? responsePayload.text : "",
            reference: isMock ? "mockReference" : orderRef,
            "meta":{}
        }
    };
}

function mapElectricityResponse(responsePayload, isMock=false) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
        reference: isMock ? "mockReference" : generateRandomReference(),
        payment_status: "Successful",
        fulfillment_status: "Succesful",
        transaction_final_amount: isMock ? "0000000" : responsePayload.amount,//in kobo
        transaction_fee: 0.00,
        pin_code: isMock ? "1234" : responsePayload.pin.pinCode,
        pin_serial_number: isMock ? "1234ABC" : responsePayload.pin.serialNumber,
        narration: "Electricity subscription was successful"
        }
    };
}

function mapTvResponse(requestPayload, responsePayload, isMock=false) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            reference: isMock ? "mockReference" : requestPayload.transaction.transaction_ref,
            payment_status: isMock ? "mockPaymentStatus" : responsePayload.transaction.status,
            fulfillment_status: isMock ? "mockFulfillmentStatus" : responsePayload.status,
            transaction_final_amount: isMock ? "0000000" : responsePayload.transaction.amount,
            transaction_fee: 0,
            narration: ""
        }
    };
}

function mapScratchCardResponse(responsePayload, orderReference, isMock=false) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            scratch_card_number: isMock ? "mock card number" : responsePayload.pin.serialNumber,
            sratch_card_pin: isMock ? "mock card pin" : responsePayload.pin.pinCode,
            scratch_card_serial: isMock ? "mock scratch serial number" : responsePayload.pin.serialNumber,
            payment_status: "Successful",
            fulfillment_status: "Succesful",
            transaction_final_amount: isMock ? "000000000" : responsePayload.amount,
            transaction_fee: 0,
            narration: "Waec Scratch card purchase was successful",
            reference: isMock ? "mockReference" : orderReference,
        }
    };
}

function mapMinNinResponse(identityResponse, orderReference, transactionRequestPayload, isMock=false) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            nin: isMock ? "123456789" : identityResponse.data.nin,
            first_name: isMock ? true : matchString(transactionRequestPayload.customer.firstname, identityResponse.data.firstname),
            middle_name: isMock ? true : matchString(transactionRequestPayload.details.middle_name, identityResponse.data.middlename),
            last_name: isMock ? true : matchString(transactionRequestPayload.customer.lastname, identityResponse.data.surname),
            dob: isMock ? true : matchString(transactionRequestPayload.details.dob, identityResponse.data.birthdate),
            reference: isMock ? "N123456789MIOL" : orderReference,
            meta: {}
        }
    };
}

function mapMidNinResponse(identityResponse, orderReference, isMock=false) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            nin: isMock ? "123456789" : identityResponse.data.nin,
            first_name: isMock ? "Luther" : identityResponse.data.firstname,
            middle_name:  isMock ? "King" : identityResponse.data.middlename,
            last_name: isMock ? "Martin" : identityResponse.data.surname,
            dob: isMock ? "25AD" : identityResponse.data.birthdate,
            phone_number1: isMock ? "+2340000000000" : identityResponse.data.telephoneno,
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