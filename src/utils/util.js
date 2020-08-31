const lodash = require('lodash');
const moment = require('moment');

function generateOTP() {
    const digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i < 4; i++ ) { 
        OTP += digits[Math.floor(Math.random() * 10)]; 
    } 
    return OTP;
}

function now() {
    return moment(Date.now());
}

function generateRandomReference() {
    return `PAYANT-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

function hashPhoneNumber(phone) {
    return `${phone.substr(0, 7)}*****${phone.substr(11, 2)}`
}

/**
 *  Convert object attribute to snake case
 * @param modelObject
 * @param mapFn
 */
const snakeCaseObjectMap = (modelObject, mapFn) => {
    const object = Object.assign({}, modelObject);
    return Object.keys(object).reduce((result, key) => {
        result[lodash.snakeCase(key)] = mapFn(object[key]);
        return result;
    }, {});
};

/**
 * Convert object attribute to camel case
 * @param modelObject
 * @param mapFn
 */
const camelCaseObjectMap = (modelObject, mapFn) => {
    const object = Object.assign({}, modelObject);
    return Object.keys(object).reduce((result, key) => {
        let value = mapFn(object[key]);

        if(value && Array.isArray(value) && value.length){
            value = value.map((eachValue) => {
                return camelCaseObjectMap(eachValue, mapFn);
            });
        } else
        if(value && typeof value == 'object' && Object.keys(value).length){
            value = camelCaseObjectMap(value, mapFn);
        }
        result[lodash.camelCase(key)] = value;

        return result;
    }, {});
};

function matchString(onsiteString, remoteString) {
    return onsiteString ? ((onsiteString.toLocaleLowerCase() === remoteString.toLocaleLowerCase()) ? true : false) : false;
}

module.exports = { generateOTP, generateRandomReference, hashPhoneNumber, snakeCaseObjectMap, camelCaseObjectMap, now, matchString };
