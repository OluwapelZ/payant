const CONSTANTS = require("../constants/constant");
const config = require("../config/config");
const { generateRandomReference, now, matchString } = require("../utils/util");

function mapErrorResponse(message) {
  return {
    status: CONSTANTS.REQUEST_STATUSES.FAILED,
    message: message,
    data: {
      provider_response_code: null,
      provider: config.provider_name,
      errors: [
        {
          code: "01",
          message: message,
        },
      ],
      error: {
        code: "01",
        message: message,
      },
      provider_response: {
        reference: generateRandomReference(),
      },
    },
  };
}

function mapWaitingForOTP(message, reference) {
  return {
    status: CONSTANTS.REQUEST_STATUSES.WAITING_FOR_OTP,
    message: message,
    data: {
      provider_response_code: "00",
      provider: "Payant",
      errors: null,
      error: null,
      provider_response: null,
      reference: reference,
    },
  };
}

function mapServiceProducts(
  rawData,
  orderReference,
  transactionRef,
  isMock = false
) {
  return {
    provider_response_code: "00",
    provider: config.provider_name,
    errors: null,
    error: null,
    provider_response: {
      products: isMock
        ? [
            {
              order_reference: "orderReference",
              biller_item_id: "productsData._id",
              biller_item_code: "element.bundleCode",
              biller_item_name: "element.name",
              biller_item_description: "",
              biller_item_image_url: "",
              biller_item_prompt: "",
              customer_name: "",
              biller_item_meta: {},
              currency: "566",
              amount: "element.amount",
              terms: null,
              terms_url: null,
            },
          ]
        : mapProducts(rawData, orderReference),
    },
    reference: isMock ? "mockReference" : transactionRef,
    meta: {},
  };
}

function mapProducts(productsData, orderReference) {
  const productList = [];
  if (productsData.productCategories.length > 0) {
    productsData.productCategories.forEach((element) => {
      productList.push({
        order_reference: orderReference,
        biller_item_id: productsData._id,
        biller_item_code: element.bundleCode,
        biller_item_name: element.name,
        biller_item_description: "",
        biller_item_image_url: "",
        biller_item_prompt: "",
        customer_name: "",
        biller_item_meta: {},
        currency: "566",
        amount: Number(element.amount) * 100,
        terms: null,
        terms_url: null,
      });
    });
  }

  return productList;
}

function mapTransactionDetails(
  reqRef,
  transactionRef,
  request,
  response,
  mappedResponse,
  requestMode,
  orderRef,
  isOrderRefActive,
  otp
) {
  return {
    onepipeRequestRef: reqRef,
    onepipeTransactionRef: transactionRef,
    providerRequest: JSON.stringify(request),
    providerStatus: response.status,
    providerResponse: JSON.stringify(response),
    mappedResponse: JSON.stringify(mappedResponse),
    orderReference: orderRef,
    isOrderActive: isOrderRefActive,
    requestMode,
    otp,
  };
}

function mapAirtimeResponse(responsePayload, amount, orderRef, isMock = false) {
  console.log(responsePayload._service_category);
  return {
    provider_response_code: "00",
    provider: config.provider_name,
    errors: null,
    error: null,
    provider_response: {
      payment_status: responsePayload.transactionStatus,
      fulfillment_status: responsePayload.status,
      transaction_final_amount: amount,
      transaction_fee: "0.00",
      narration: isMock
        ? " "
        : `${
            responsePayload._service_category.name
              ? responsePayload._service_category.name
              : ""
          }:${amount ? amount : "0"}, ${responsePayload.status}`,
      reference: isMock ? "7bdb863471fa31f7e37418e103d" : orderRef,
      meta: {},
    },
  };
}

function mapDataResponse(responsePayload, amount, orderRef, isMock = false) {
  return {
    provider_response_code: "00",
    provider: config.provider_name,
    errors: null,
    error: null,
    provider_response: {
      payment_status: responsePayload.transactionStatus,
      fulfillment_status: responsePayload.status,
      transaction_final_amount: isMock ? "0.00" : amount,
      transaction_fee: "0.00",
      narration: isMock
        ? " "
        : `${responsePayload._service_category.name}: ${responsePayload.request_payload.bundleCode} MB, ${responsePayload.status}`,
      reference: isMock ? "mockReference" : orderRef,
      meta: {},
    },
  };
}

function mapElectricityResponse(responsePayload, isMock = false) {
  return {
    provider_response_code: "00",
    provider: config.provider_name,
    errors: null,
    error: null,
    provider_response: {
      reference: isMock ? "mockReference" : generateRandomReference(),
      payment_status: "Successful",
      fulfillment_status: "Succesful",
      transaction_final_amount: isMock ? "0000000" : responsePayload.amount, //in kobo
      transaction_fee: 0.0,
      pin_code: isMock ? "1234" : responsePayload.pin.pinCode,
      narration: "Electricity subscription was successful",
    },
  };
}

function mapTvResponse(requestPayload, responsePayload, isMock = false) {
  return {
    provider_response_code: "00",
    provider: config.provider_name,
    errors: null,
    error: null,
    provider_response: {
      reference: isMock
        ? "mockReference"
        : requestPayload.transaction.transaction_ref,
      payment_status: isMock
        ? "mockPaymentStatus"
        : responsePayload.transaction.status,
      fulfillment_status: isMock
        ? "mockFulfillmentStatus"
        : responsePayload.status,
      transaction_final_amount: isMock
        ? "0000000"
        : responsePayload.transaction.amount,
      transaction_fee: 0,
      narration: "",
    },
  };
}

function mapScratchCardResponse(
  responsePayload,
  orderReference,
  isMock = false
) {
  const data = {
    provider_response_code: "00",
    provider: config.provider_name,
    errors: null,
    error: null
  };
  //Indicate a successful pin retrieval
  if (responsePayload.transaction.pin) {
    data.provider_response = {
      scratch_card_number: isMock
        ? "mock card number"
        : responsePayload.transaction.pin.serialNumber,
      sratch_card_pin: isMock
        ? "mock card pin"
        : responsePayload.transaction.pin.pinCode,
      scratch_card_serial: isMock
        ? "mock scratch serial number"
        : responsePayload.transaction.pin.serialNumber,
      payment_status: isMock ? "Successful" : responsePayload.status,
      fulfillment_status: isMock ? "Successful" : responsePayload.message,
      transaction_final_amount: isMock
        ? "000000000"
        : responsePayload.transaction.amount,
      transaction_fee: 0,
      narration: "Waec Scratch card purchase was successful",
      reference: isMock ? "mockReference" : orderReference,
    };
  } else {
    data.provider_response = {
      scratch_card_number: "",
      sratch_card_pin: "",
      scratch_card_serial: "",
      payment_status: "Failed",
      fulfillment_status: "Failed",
      transaction_final_amount: responsePayload.transaction.amount,
      transaction_fee: 0,
      narration: "Unable to purchase scratch card",
      reference: orderReference,
    };
  }
  return data;
}

function mapMinNinResponse(
  identityResponse,
  orderReference,
  transactionRequestPayload,
  isMock = false
) {
  //Map Payant DOB's (DD-MM-YYYY) to Onepipe's format (YYYY-MM-DD);

  let splittedDate = identityResponse.data.birthdate
    ? identityResponse.data.birthdate.split("-")
    : [];
  let reverseDate = splittedDate.reverse().join("-");
  var onePipeResponse = {
    provider_response_code: "00",
    provider: config.provider_name,
    errors: null,
    error: null,
    provider_response: {
      nin: isMock ? "123456789" : identityResponse.data.nin,
      first_name: isMock
        ? true
        : matchString(
            transactionRequestPayload.details.first_name,
            identityResponse.data.firstname
          ),
      middle_name: isMock
        ? true
        : matchString(
            transactionRequestPayload.details.middle_name,
            identityResponse.data.middlename
          ),
      last_name: isMock
        ? true
        : matchString(
            transactionRequestPayload.details.last_name,
            identityResponse.data.surname
          ),
      dob: isMock
        ? true
        : matchString(transactionRequestPayload.details.dob, reverseDate),
      reference: isMock ? "N123456789MIOL" : orderReference,
      meta: {},
    },
  };
  var providerResponseProps = ["dob", "first_name", "last_name", "middle_name"];
  providerResponseProps.forEach((prop) => {
    if (!transactionRequestPayload.details[prop])
      delete onePipeResponse.provider_response[prop];
  });
  return onePipeResponse;
}

function mapMidNinResponse(identityResponse, orderReference, isMock = false) {
  let splittedDate = identityResponse.data.birthdate
    ? identityResponse.data.birthdate.split("-")
    : [];
  let reverseDate = splittedDate.reverse().join("-");
  return {
    provider_response_code: "00",
    provider: config.provider_name,
    errors: null,
    error: null,
    provider_response: {
      nin: isMock ? "123456789" : identityResponse.data.nin,
      first_name: isMock ? "Luther" : identityResponse.data.firstname,
      middle_name: isMock ? "King" : identityResponse.data.middlename,
      last_name: isMock ? "Martin" : identityResponse.data.surname,
      dob: isMock ? "05-05-2000" : reverseDate,
      phone_number1: isMock
        ? "+2340000000000"
        : identityResponse.data.telephoneno,
      phone_number2: "",
      reference: isMock ? "PAYANT06879678" : orderReference,
      meta: {},
    },
  };
}

function mapAPILogger(requestPayload, responsePayload) {
  return {
    platform: "Onepipe",
    client: {
      client_id: requestPayload.transaction.client_info.id,
      client_name: requestPayload.transaction.client_info.name,
      client_app_id: requestPayload.transaction.app_info.id,
      client_app_name: requestPayload.transaction.app_info.name,
    },
    transaction: {
      transaction_ref: requestPayload.transaction.transaction_ref,
      transaction_timestamp: requestPayload.transaction_time,
    },
    request: {
      source_name: "Onepipe payant integration",
      destination_name: "Payant",
      request_type: requestPayload.request_type,
      request_timestamp: now().toISOString(),
      request_description: requestPayload.request_description,
      destination_url: requestPayload.destination_url,
      request_headers: requestPayload.headers,
      request_body: requestPayload.body,
    },
    response: {
      response_timestamp: now().toISOString(),
      response_http_status: responsePayload.status,
      response_code: responsePayload.statusText,
      response_headers: responsePayload.headers,
      response_body: responsePayload.data,
    },
  };
}

module.exports = {
  mapErrorResponse,
  mapWaitingForOTP,
  mapServiceProducts,
  mapTransactionDetails,
  mapAirtimeResponse,
  mapDataResponse,
  mapMinNinResponse,
  mapMidNinResponse,
  mapElectricityResponse,
  mapTvResponse,
  mapScratchCardResponse,
  mapAPILogger,
};
