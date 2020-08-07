const Transaction = require('../../src/models/transaction');
const BaseService = require('../../src/services/base');
const { InvalidParamsError, InvalidRequestModeError, BillerNotSupportedError, CustomerVerificationError } = require('../../src/error/index');
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

describe('Electricity Service', () => {
    const baseService = new BaseService();
    it('service should be defined', (done) => {
        expect(baseService).toBeDefined();
        done();
    })

    it('should throw error if biller id is not provided', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'pay_electricity';
        requestPayload.transaction.details.biller_id = null;
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.buyElectricityService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof InvalidParamsError).toBe(true);
            done();
        }
    });

    it('should throw error if service buy_electricity does not support biller', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'pay_electricity';
        requestPayload.transaction.details.biller_id = 'invalid_biller';
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.buyElectricityService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof BillerNotSupportedError).toBe(true);
            done();
        }
    });

    it('should throw error when customer verification is not successful', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'pay_electricity';
        requestPayload.transaction.details.biller_id = 'IKEDCPR';
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        payantServiceApiCall.mockResolvedValue({status: 'pending'});
        try {
            await baseService.buyElectricityService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof CustomerVerificationError).toBe(true);
            done();
        }
    });

    it('should throw error when customer ref, amount or mobile number is not passed', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'pay_electricity';
        requestPayload.transaction.details.biller_id = 'IKEDCPR';
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        delete requestPayload.transaction.amount;
        try {
            await baseService.buyElectricityService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof InvalidParamsError).toBe(true);
            done();
        }
    });

    it('should successfully purchase electricity', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'pay_electricity';
        requestPayload.transaction.details.biller_id = 'IKEDCPR';
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        payantServiceApiCall.mockResolvedValue({status: 'success'});
        try {
            await baseService.buyElectricityService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})

            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(payantServiceApiCall).toHaveBeenCalled();
            done()
        } catch (error) {
            done();
        }
    });
})