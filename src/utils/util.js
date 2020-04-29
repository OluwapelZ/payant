function generateOTP() {
    const digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i < 4; i++ ) { 
        OTP += digits[Math.floor(Math.random() * 10)]; 
    } 
    return OTP;
}

function generateRandomReference() {
    return `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

function hashPhoneNumber(phone) {
    return `${phone.substr(0, 7)}*****${phone.substr(11, 2)}`
}

module.exports = { generateOTP, generateRandomReference, hashPhoneNumber };