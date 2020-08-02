const authMiddleware = require('../../src/middleware/auth');
const { authenticate } = require('../../src/utils/third_party_api_call');
const { req, res, encryptedValidData, emptyAuthSecureData, authenticateToken, emptyInvalidAuthData } = require('../fixtures/index');

jest.mock('../../src/utils/third_party_api_call', () => {
    return {
        authenticate: jest.fn()
    }
});

afterAll(done => {
    done()
});

describe('Authentication middleware', () => {
    const next = jest.fn();
    it('should throw error if both secure and app_info doesn\'t have username and password', async (done) => {
        req.body.data = emptyInvalidAuthData;
        await authMiddleware.authenticatePayantUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401)
        done();
    });

    it('should throw an error if authenticate returns a status of type error', async (done) => {
        req.body.data = encryptedValidData;
        authenticate.mockResolvedValue({status: 'error', token: authenticateToken})

        await authMiddleware.authenticatePayantUser(req, res, next);
        expect(authenticate).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401)
        done();
    });

    it('should successfully authenticate user with auth.secure details', async (done) => {
        req.body.data = encryptedValidData;
        authenticate.mockResolvedValue({status: 'success', token: authenticateToken})

        await authMiddleware.authenticatePayantUser(req, res, next);
        expect(authenticate).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        done();
    });
});