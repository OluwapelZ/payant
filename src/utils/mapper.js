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

function mapLoans(rawLoansData) {
    const loans = [];
    if (rawLoansData > 0) {
        rawLoansData.forEach(element => {
            loans.push(
                {
                    account_number: null,
                    account_name: null,
                    bank_name: null,
                    bank_code: null,
                    loan_date: element.disbursedDate,
                    loan_amount: element.principal,
                    loan_fees: element.lateFees,
                    loan_interest_percent: null,
                    loan_interest_amount: element.interest,
                    loan_due_amount: element.totalOutstanding,
                    loan_due_date: element.dueDate,
                    lender_code: null,
                    lender_name: "Payant",
                    lender_terms: null,
                    lender_terms_url: null,
                    extended_data: {
                        total_paid: element.totalPaid
                    }
                }
            )
        });
    }

    return loans;
}

module.exports = { getLoanStatusMapper, mapErrorResponse, mapWaitingForOTP };