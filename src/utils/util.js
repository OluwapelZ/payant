const fs = require('fs');

function generateOTP() {
    const digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i < 4; i++ ) { 
        OTP += digits[Math.floor(Math.random() * 10)]; 
    } 
    return OTP;
}

async function writeToStorageFile(otp, transactionRef, data) {
    try {
        const storageFile = fs.readFileSync('hashed_with_otp.json');
        let fileContent = JSON.parse(storageFile);

        if (fileContent.hasOwnProperty(transactionRef)) {
            fileContent[transactionRef] = {otp: otp, data: data};
        } else {
            let object = {};
            object[`${transactionRef}`] = {otp: otp, data: data};
            fileContent = Object.assign(fileContent, object);
        }

        fs.writeFile('hashed_with_otp.json', JSON.stringify(fileContent), (err) => {
            if (err) {
                throw err;
            }
        });
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

async function readFromStorageFile(otp, transactionRef) {
    try {
        const storageFile = fs.readFileSync('hashed_with_otp.json');
        const fileContent = JSON.parse(storageFile);

        if (fileContent[transactionRef] && (fileContent[transactionRef].otp == otp))
            return fileContent[transactionRef].data;

        return null;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

module.exports = { generateOTP, writeToStorageFile, readFromStorageFile };