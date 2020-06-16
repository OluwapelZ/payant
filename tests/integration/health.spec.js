const server = require('../../src/app');
const supertest = require('supertest');
const request = supertest(server);

describe('Health Status', () => {
    it('Should return status as true', async done => {
        const response = await request.get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('Successful');
        expect(response.body).toHaveProperty('message');
        done();
    })
})