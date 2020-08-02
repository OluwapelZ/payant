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

afterAll(done => {
    done()
});

describe('Data Service', () => {
    const baseService = new BaseService();
    it('service should be defined', (done) => {
        expect(baseService).toBeDefined();
        done();
    });

    it('should throw error if biller or biller item id is not passed', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'buy_data';
        requestPayload.transaction.details.biller_id = 'Smile';
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.buyDataService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done()
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof InvalidParamsError).toBe(true);
            done();
        }
    });

    it('should throw error if buy_data service does not support biller', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'buy_data';
        requestPayload.transaction.details.biller_id = 'invalid_biller';
        requestPayload.transaction.details.biller_item_id = 900
        requestPayload.transaction.details.order_reference = 'sfsfsdf';
        try {
            await baseService.buyDataService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done()
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof BillerNotSupportedError).toBe(true);
            done();
        }
    });

    it('should throw error if provider does not support the provided telco_code', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'buy_data';
        requestPayload.transaction.details.biller_id = 'Smile';
        requestPayload.transaction.details.biller_item_id = 900;
        requestPayload.transaction.details.order_reference = 'sfsfsdf';

        delete requestPayload.transaction.amount;
        try {
            await baseService.buyDataService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
            done()
        } catch (error) {
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(error instanceof InvalidParamsError).toBe(true);
            done();
        }
    });

    it('should throw error if provider does not support the provided telco_code', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'transact';
        const fetchTransactionByRefMock = (Transaction.prototype.fetchTransactionByOrderRef = jest.fn());
        requestPayload.request_type = 'buy_data';
        requestPayload.transaction.details.biller_id = 'Smile';
        requestPayload.transaction.details.biller_item_id = 900;
        requestPayload.transaction.details.order_reference = 'sfsfsdf';

        try {
            await baseService.buyDataService({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'});
            expect(fetchTransactionByRefMock).toHaveBeenCalled();
            expect(payantServiceApiCall).toHaveBeenCalled();
            done()
        } catch (error) {
            done();
        }
    });
})