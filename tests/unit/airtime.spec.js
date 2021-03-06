const Transaction = require('../../src/models/transaction');
const BaseService = require('../../src/services/base');
const { InvalidParamsError, BillerNotSupportedError } = require('../../src/error/index');
const { payantServiceApiCall } = require('../../src/utils/third_party_api_call');
const { invalidData } = require('../fixtures/airtime');

jest.mock('../../src/utils/third_party_api_call', () => {
    return {
        payantServiceApiCall: jest.fn(),
        getTransactionStatus: jest.fn()
    }
});

afterAll(done => {
    done()
});

describe('Airtime Service', () => {
    const baseService = new BaseService();
    it('service should be defined', (done) => {
        expect(baseService).toBeDefined();
        done();
    });

    it('should throw error when request type is not buy airtime', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.request_mode = 'transact';
        requestPayload.request_type = 'not_implemented';
        requestPayload.transaction.details.order_reference = 'sdfdsf';
        try {
            await baseService.buyAirtimeService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done()
        } catch (error) {
            console.log(error.stack)
            expect(error instanceof InvalidParamsError).toBe(true);
            done();
        }
    });

    it('should throw error if provider does not support the provided telco_code', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.request_mode = 'transact';
        requestPayload.request_type = 'buy airtime';
        requestPayload.transaction.details.telco_code = 'invalid_telco_code';
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.buyAirtimeService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done()
        } catch (error) {
            expect(error instanceof BillerNotSupportedError).toBe(true);
            done();
        }
    });

    it('should throw error if customer reference(phone number) or amount is missing', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.request_mode = 'transact';
        requestPayload.request_type = 'buy airtime';
        requestPayload.transaction.details.telco_code = 'Glo';
        delete requestPayload.transaction.amount;
        delete requestPayload.transaction.customer.customer_ref
        try {
            await baseService.buyAirtimeService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(error instanceof InvalidParamsError).toBe(true);
            done();
        }
    });

    it('should successfully buy airtime', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.request_mode = 'transact';
        requestPayload.request_type = 'buy airtime';
        requestPayload.transaction.details.telco_code = 'Glo';
        requestPayload.transaction.amount = 1000;
        requestPayload.transaction.customer.customer_ref = '09056351003'
        try {
            await baseService.buyAirtimeService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})

            expect(payantServiceApiCall).toHaveBeenCalled();
            done();
        } catch (error) {
            done();
        }
    });
})