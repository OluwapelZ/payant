const { listProviderServicesAPI } = require('../utils/third_party_api_call');
const { failed, success } = require('../utils/http_response');
const { mapProviderServices } = require('../utils/mapper');
const CONSTANTS = require('../config/constant');
const ResponseMessage = require('../config/response_messages');

module.exports = {
    baseService: async (req, res) => {
        console.log('I got into the service: ', req.body.data)
        process.exit();
    },
    
    listProviderServices: async (req, res) => {
       try {
        const services = await listProviderServicesAPI(req.body.token);
        const mappedServices = mapProviderServices(services.data);
        success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.FETCHED_LOAN_STATUS_SUCCESSFULLY, mappedServices);
       } catch (error) {
           failed(res, 500, error.message, error.stack)
       }
    }
}