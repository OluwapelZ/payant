const { encrypt, decrypt } = require('../utils/crypt');
const { getLoanStatus, sendOTP } = require('../utils/third_party_api_call');
const { getLoanStatusMapper } = require('../utils/mapper');
const { generateOTP, readFromStorageFile, writeToStorageFile } = require('../utils/util');
const config = require('../config/config');
const CONSTANTS = require('../config/constant');
const ResponseMessage = require('../config/respnose_messages');
const { success, failed, waitingForOTP, wrongAuthProvder } = require('../utils/http_response');

async function getStatus(req, res) {
    try {
        const loanRequestPayload = JSON.parse(decrypt(config.crypt_key, req.body.data));
        const transaction = loanRequestPayload.transaction;

        if (loanRequestPayload.auth.auth_provider != config.provider_name) {
            return wrongAuthProvder(res, CONSTANTS.REQUEST_STATUSES.FAILED, ResponseMessage.INVALID_AUTH_PROVIDER_NAME);
        }
        
        if (loanRequestPayload.request_mode == CONSTANTS.REQUEST_TYPES.TRANSACT) {
            const loanStatusResponse =  await getStatusFromMigo(transaction.customer.customer_ref);

            if (loanRequestPayload.transaction.details.otp_override == true || loanRequestPayload.transaction.app_info.extras.otp_override == true) {
                return success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.FETCHED_LOAN_STATUS_SUCCESSFULLY, getLoanStatusMapper(loanStatusResponse));
            }
            const otp = generateOTP();

            // Send OTP verification sms
            sendOTPSms(transaction.customer.mobile_no, transaction.customer.surname, otp);

            // Save response in File storage with otp
            await writeToStorageFile(otp, transaction.transaction_ref, encrypt(config.crypt_key, JSON.stringify(getLoanStatusMapper(loanStatusResponse))));

            //Send response
            return waitingForOTP(res, CONSTANTS.STATUS_CODES.WAITING_FOR_OTP, ResponseMessage.SUCCESSFULLY_SENT_OTP);
        } else if (loanRequestPayload.request_mode == CONSTANTS.REQUEST_TYPES.VALIDATE) {
            const data = await validateOTP(loanRequestPayload.auth.secure, loanRequestPayload.transaction.transaction_ref);
             
            return (data) ? success(res, CONSTANTS.STATUS_CODES.SUCCESS, ResponseMessage.FETCHED_LOAN_STATUS_SUCCESSFULLY, JSON.parse(decrypt(config.crypt_key, data))) : failed(res, CONSTANTS.STATUS_CODES.FAILED, ResponseMessage.INVALID_OTP);
        }
    } catch (error) {
        failed(res, CONSTANTS.STATUS_CODES.FAILED, error.stack);
    }
}

function getStatusFromMigo(customerRef) {
    return getLoanStatus(customerRef);
}

/*
* Validate otp logic - {otp & transactionRef}
*/
async function validateOTP(otp, transactionRef) {
    const data = await readFromStorageFile(otp, transactionRef);
    return data;
}

function sendOTPSms(phone, surname, otp) {
    try {
        const smsData = {
            senderName: 'OnePipe - Verify OTP',
            recipientPhoneNumber: phone,
            message: `Hello ${surname}, the otp for your get loans request is: ${otp}. Please contact us if you did not initiate this request`
        };
    
        return sendOTP(smsData);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = { getStatus }