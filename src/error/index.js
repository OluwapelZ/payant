const createCustomError = require('custom-error-generator');

const InvalidRequestModeError = createCustomError('InvaidRequestModeError', { code: 'INVALID_REQUEST_MODE_ERROR' });

const BillerProductError = createCustomError('BillerProductError', { code: 'BILLER_PRODUCT_ERROR' });

const ServiceProductCategoryError = createCustomError('ServiceProductCategoryError', {  code: 'SERVICE_PRODUCT_CATEGORY_ERROR' });

module.exports = { InvalidRequestModeError, BillerProductError, ServiceProductCategoryError };