const createCustomError = require('custom-error-generator');

export const InvalidRequestModeError = createCustomError('InvaidRequestModeError', { code: 'INVALID_REQUEST_MODE_ERROR' });

export const BillerProductError = createCustomError('BillerProductError', { code: 'BILLER_PRODUCT_ERROR' });

export const ServiceProductCategoryError = createCustomError('ServiceProductCategoryError', {  code: 'SERVICE_PRODUCT_CATEGORY_ERROR' });