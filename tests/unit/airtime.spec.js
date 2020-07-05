const Transaction = require('../../src/models/transaction');
const BaseService = require('../../src/services/base');
const { InvalidParamsError, InvalidRequestModeError, ProviderResponseError, BillerNotSupportedError, ServiceNotImplementedError } = require('../../src/error/index');
const { payantServiceApiCall, getTransactionStatus } = require('../../src/utils/third_party_api_call');
const { invalidData, optionsProviderResponse } = require('../fixtures/airtime');

jest.mock('../../src/utils/third_party_api_call', () => {
    return {
        payantServiceApiCall: jest.fn(),
        getTransactionStatus: jest.fn()
    }
});

describe('Airtime Service', () => {
    const baseService = new BaseService();
    it('service should be defined', (done) => {
        expect(baseService).toBeDefined();
        done();
    })

    it('should throw error when request mode is not options', async (done) => {
        try {
            await baseService.baseService({data: invalidData, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
        } catch (error) {
            expect(error instanceof InvalidRequestModeError).toBe(true);
            done();
        }
    });

    it('should throw error provider does not currently implement service', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'not_implemented';
        requestPayload.transaction.details.order_reference = 'sdfdsf';
        try {
            await baseService.baseService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
        } catch (error) {
            console.log(error.stack)
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof ServiceNotImplementedError).toBe(true);
            done();
        }
    });

    it('should throw error if does not support the provided telco_code', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'buy_airtime';
        requestPayload.transaction.details.tel_code = 'invalid_telco_code';
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.baseService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof BillerNotSupportedError).toBe(true);
            done();
        }
    });

    // it('should throw error if customer reference(phone number) or amount is missing', async (done) => {
    //     const requestPayload = Object.assign({}, invalidData);
    //     requestPayload.auth.route_mode = 'transact';
    //     requestPayload.request_type = 'buy_airtime';
    //     requestPayload.transaction.details.tel_code = 'Glo';
    //     delete requestPayload.transaction.amount;
    //     delete requestPayload.transaction.customer.customer_ref
    //     try {
    //         await baseService.baseService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
    //     } catch (error) {
    //         console.log(error);
    //         expect(error instanceof InvalidParamsError).toBe(true);
    //         done();
    //     }
    // });
})