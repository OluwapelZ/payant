const CONSTANTS = require('../constants/constant');
const config = require('../config/config');
const { generateRandomReference } = require('../utils/util');

function getLoanStatusMapper(rawData) {
    return {
        provider_response_code: "00",
        provider: "Payant",
        errors: null,
        error: null,
        provider_response: {
            loans: mapLoans(rawData),
            reference: generateRandomReference()
        }
    };
}

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
            products: mapProducts(rawData.data.productCategories),
        },
    };
}

function mapProducts(productsData) {
    const productList = [];
    if (productsData.productCategories > 0) {
        productsData.productCategories.forEach(element => {
            productList.push(
                {
                    order_reference: productsData._id,
                    biller_item_id: productsData._id,
                    biller_item_code: element.code,
                    biller_item_name: element.name,
                    biller_item_description: '',
                    biller_item_image_url: '',
                    biller_item_prompt: '',
                    customer_name: '',
                    biller_item_meta: {},
                    currency: '566',
                    bundleCode: element.bundleCode,
                    amount: element.amount
                }
            )
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



module.exports = { getLoanStatusMapper, mapErrorResponse, mapWaitingForOTP, mapServiceProducts, mapTransactionDetails };