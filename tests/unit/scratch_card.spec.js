const Transaction = require('../../src/models/transaction');
const BaseService = require('../../src/services/base');
const { InvalidParamsError, InvalidRequestModeError, ProviderResponseError, BillerNotSupportedError } = require('../../src/error/index');
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

describe('Scratch Card Service', () => {
    const baseService = new BaseService();
    it('service should be defined', (done) => {
        expect(baseService).toBeDefined();
        done();
    });

    it('should throw error if biller id is not passed', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'buy_scratch_card';
        delete requestPayload.transaction.details.biller_id;
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.buyScratchCardService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof InvalidParamsError).toBe(true);
            done();
        }
    });

    it('should throw error if service does not currently support biller', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'buy_scratch_card';
        requestPayload.transaction.details.biller_id = 'invalid_tv';
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.buyScratchCardService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done();
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof BillerNotSupportedError).toBe(true);
            done();
        }
    });

    it('should throw error when amount is not provided', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'buy_scratch_card';
        requestPayload.transaction.details.biller_id = 'waec_scratch_card';
        delete requestPayload.transaction.amount;
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.buyScratchCardService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done()
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof InvalidParamsError).toBe(true);
            done();
        }
    });

    // it('should successfully purchase waec scratch card', async (done) => {
    //     const requestPayload = Object.assign({}, invalidData);
    //     requestPayload.auth.route_mode = 'transact';
    //     const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
    //     requestPayload.request_type = 'buy_scratch_card';
    //     requestPayload.transaction.details.biller_id = 'waec_scratch_card';
    //     requestPayload.transaction.amount = 950;
    //     requestPayload.transaction.details.order_reference = 'sfsfsdf';
    //     payantServiceApiCall.mockResolvedValue({status: 'success'});
        
    //     await baseService.buyScratchCardService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})

    //     expect(fetchTransactionByRefMock).toHaveBeenCalled();
    //     expect(payantServiceApiCall).toHaveBeenCalled();
    //     done();
    // });
});