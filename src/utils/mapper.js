const CONSTANTS = require('../config/constant');
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

function mapProviderServices(rawData) {
    const services = [];
    if (rawData.length > 0) {
        rawData.forEach(element => {
            services.push(
                {
                    id: element._id,
                    name: element.name,
                    service_categories: element.service_categories
                }
            )
        });
    }

    return services;
}



module.exports = { getLoanStatusMapper, mapErrorResponse, mapWaitingForOTP, mapProviderServices };