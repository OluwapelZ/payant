const createCustomError = require('custom-error-generator');

const InvalidRequestModeError = createCustomError('InvaidRequestModeError', { code: 'INVALID_REQUEST_MODE' });

const InvalidParamsError = createCustomError('InvalidParamsError', { code: 'INVALID_PARAMS' });

const CustomerVerificationError = createCustomError('CustomerVerificationError', { code: 'CUSTOMER_VERIFICATION_ERROR' });

const BillerProductError = createCustomError('BillerProductError', { code: 'BILLER_PRODUCT_ERROR' });

const ServiceProductCategoryError = createCustomError('ServiceProductCategoryError', {  code: 'SERVICE_PRODUCT_CATEGORY_ERROR' });

const BillerNotSupportedError = createCustomError('BillerNotsupportedError', { code: 'BILLER_NOT_SUPPORTED' });

const ServiceNotImplementedError = createCustomError('ServiceNotImplementedError', {  code: 'SERVICE_NOT_IMPLEMENTED' });

const ProviderResponseError = createCustomError('ProviderResponseError', { code: 'PROVIDER_RESPONSE_ERROR' });

const TransactionNotFoundError = createCustomError('TransactionNotFoundError', {  code: 'TRANSACTION_NOT_FOUND' });

const InvalidOtpError = createCustomError('InvalidOtpError', { code: 'INVALID_OTP' });

const AutheticationError = createCustomError('AuthenticationError', { code: 'AUTHENTICATION_ERROR' });

module.exports = {
    InvalidRequestModeError,
    BillerProductError,
    ServiceProductCategoryError,
    BillerNotSupportedError,
    ServiceNotImplementedError,
    InvalidParamsError,
    ProviderResponseError,
    TransactionNotFoundError,
    CustomerVerificationError,
    InvalidOtpError,
    AutheticationError
};