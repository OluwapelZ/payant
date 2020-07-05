const Transaction = require('../../src/models/transaction');
const BaseService = require('../../src/services/base');
const { InvalidRequestModeError, BillerProductError, BillerNotSupportedError, ServiceProductCategoryError } = require('../../src/error/index');
const { listServiceProductsAPI } = require('../../src/utils/third_party_api_call');
const { invalidData, optionsProviderResponse } = require('../fixtures/index');

jest.mock('../../src/utils/third_party_api_call', () => {
    return {
        listServiceProductsAPI: jest.fn(),
        payantServiceApiCall: jest.fn().mockResolvedValue({status: 'success'})
    }
});

describe('Product Listing', () => {
    const baseService = new BaseService();
    it('service should be defined', (done) => {
        expect(baseService).toBeDefined();
        done();
    })

    it('should throw error when request mode is not options', async (done) => {
        try {
            await baseService.listProviderServices({data: invalidData, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
        } catch (error) {
            expect(error instanceof InvalidRequestModeError).toBe(true);
            done();
        }
    });

    it('should throw error if biller id was not sent with request payload', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'options';
        try {
            await baseService.listProviderServices({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
        } catch (error) {
            expect(error instanceof BillerProductError).toBe(true);
            done();
        }
    });

    it('should throw error if details object was not sent with request payload', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'options';
        delete requestPayload.transaction.details;
        try {
            await baseService.listProviderServices({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
        } catch (error) {
            expect(error instanceof BillerProductError).toBe(true);
            done();
        }
    });

    it('should throw error if provider does not support the provided biller', async (done) => {
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'options';
        requestPayload.transaction.details = {
            biller_id: 'cuptv'
        }
        try {
            await baseService.listProviderServices({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
        } catch (error) {
            expect(error instanceof BillerNotSupportedError).toBe(true);
            done();
        }
    });

    it('should throw error when payant returns error', async (done) => {
        listServiceProductsAPI.mockResolvedValue({status: 'error'});
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'options';
        requestPayload.transaction.details = {
            biller_id: 'dstv'
        }
        try {
            await baseService.listProviderServices({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
        } catch (error) {
            expect(listServiceProductsAPI).toHaveBeenCalled();
            expect(error instanceof ServiceProductCategoryError).toBe(true);
            done();
        }
    });

    it('should successfully return biller item lists', async (done) => {
        listServiceProductsAPI.mockResolvedValue(optionsProviderResponse);
        const createTransactionMock = (Transaction.prototype.createTransaction = jest.fn());
        const requestPayload = Object.assign({}, invalidData);
        requestPayload.auth.route_mode = 'options';
        requestPayload.transaction.details = {
            biller_id: 'dstv'
        };

        await baseService.listProviderServices({data: requestPayload, token: '23423jiu98ipajhiufhi27yf0ayfdhvzbONDUFHuiwrfa-sdfuiwer'})
        expect(createTransactionMock).toHaveBeenCalled();
        done();

    });
})