const Transaction = require('../../src/models/transaction');
const BaseService = require('../../src/services/base');
const { InvalidParamsError, InvalidRequestModeError, ProviderResponseError, BillerNotSupportedError, CustomerVerificationError } = require('../../src/error/index');
const { payantServiceApiCall, getTransactionStatus } = require('../../src/utils/third_party_api_call');
const { invalidData, optionsProviderResponse } = require('../fixtures/index');

jest.mock('../../src/utils/third_party_api_call', () => {
    return {
        payantServiceApiCall: jest.fn(),
        getTransactionStatus: jest.fn()
    }
});

afterAll(done => {
    done()
});

describe('Tv Service', () => {
    const baseService = new BaseService();
    it('service should be defined', (done) => {
        expect(baseService).toBeDefined();
        done();
    });

    it('should throw error if biller or biller item id is not passed', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.request_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'pay tv';
        requestPayload.transaction.details.biller_id = 'invalid_tv';
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.buyTvService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof InvalidParamsError).toBe(true);
            done();
        }
    });

    it('should throw error if pay tv service does not support biller', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.request_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'pay tv';
        requestPayload.transaction.details.biller_id = 'invalid_biller';
        requestPayload.transaction.details.biller_item_id = 900
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.buyTvService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof BillerNotSupportedError).toBe(true);
            done();
        }
    });

    it('should throw error if amount or customer_ref is not provided', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.request_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'pay tv';
        requestPayload.transaction.details.biller_id = 'gotv';
        requestPayload.transaction.details.biller_item_id = 900
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        delete requestPayload.transaction.amount;
        try {
            await baseService.buyTvService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof InvalidParamsError).toBe(true);
            done();
        }
    });

    it('should throw error when customer verification is not successful', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.request_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'pay tv';
        requestPayload.transaction.details.biller_id = 'gotv';
        requestPayload.transaction.details.biller_item_id = 900
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        requestPayload.transaction.amount = 990
        payantServiceApiCall.mockResolvedValue({status: 'pending'});
        try {
            await baseService.buyTvService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof CustomerVerificationError).toBe(true);
            done();
        }
    });

    it('should successfully purchase tv', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.request_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'pay tv';
        requestPayload.transaction.details.biller_id = 'gotv';
        requestPayload.transaction.details.biller_item_id = 900
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        requestPayload.transaction.amount = 990
        payantServiceApiCall.mockResolvedValue({status: 'success'});
        try {
            await baseService.buyTvService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})

            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(payantServiceApiCall).toHaveBeenCalled();
            done()
        } catch (error) {
            done();
        }
    });
});