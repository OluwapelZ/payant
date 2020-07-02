const CONSTANTS = require('../constants/constant');
const config = require('../config/config');
const { generateRandomReference } = require('../utils/util');

function mapErrorResponse(message, stack) {
    return {
        status: CONSTANTS.REQUEST_STATUSES.FAILED,
        message: message,
        data: {
            provider_response_code: null,
            provider: "Payant",
            errors: stack,
            error: message,
            provider_response: {
                reference: generateRandomReference()
            },
        }
    }
}

function mapWaitingForOTP(message) {
    return {
        status: CONSTANTS.REQUEST_STATUSES.WAITING_FOR_OTP,
        message: message,
        data: {
            provider_response_code: "900T0",
            provider: "Payant",
            errors: null,
            error: null,
            provider_response: {
                reference: generateRandomReference()
            }
        }
    }
}

function mapServiceProducts(rawData) {
    return {
        provider_response_code: '00',
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            products: mapProducts(rawData),
        },
        reference: generateRandomReference(),
        meta: {}
    };
}

function mapProducts(productsData) {
    const productList = [];
    if (productsData.productCategories.length > 0) {
        const orderReference = generateRandomReference();
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

function mapTransactionDetails(reqRef, transactionRef, request, response) {
    return {
        onepipeRequest_ref: reqRef,
        onepipeTransactionRef: transactionRef,
        providerRequest: JSON.stringify(request),
        providerStatus: response.status,
        providerResponse: JSON.stringify(response)
    }
}

function mapAirtimeResponse(responsePayload, amount) {
    return {
        provider_response_code: "00",
        provider: config.provider_name,
        errors: null,
        error: null,
        provider_response: {
            payment_status: "Processing",
            fulfillment_status: "Succesful",
            transaction_final_amount: (Number(amount) * 100), //In kobo
            transaction_fee: "0.00",
            narration: (responsePayload.text) ? responsePayload.text : "",
            reference: generateRandomReference(),
            "meta":{}
        }
    };
}

function mapDataResponse() {
    return {

    };
}

function mapElectricityResponse() {
    return {

    };
}

function mapTvResponse() {
    return {

    };
}

function mapScratchCardResponse() {
    return {

    };
}

function mapMinNinResponse() {
    return {

    };
}

function mapMidNinResponse() {
    return {

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
    mapScratchCardResponse
};