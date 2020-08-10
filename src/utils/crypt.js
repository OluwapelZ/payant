const crypto = require("crypto");
const config = require('../config/config');

function encrypt(sharedKey, plainText) {
  try {
    const bufferedKey = Buffer.from(sharedKey, "utf16le");
    const key = crypto
      .createHash("md5")
      .update(bufferedKey)
      .digest();
    const newKey = Buffer.concat([key, key.slice(0, 8)]);
    const IV = Buffer.alloc(8, "\0");
    const cipher = crypto
      .createCipheriv("des-ede3-cbc", newKey, IV)
      .setAutoPadding(true);
    return cipher.update(plainText, "utf8", "base64") +
    cipher.final("base64");

  } catch (error) {
    console.log(error.message)
    throw error;
  }
}

function decrypt(sharedKey, cipherText) {
  try {
    const bufferedKey = Buffer.from(sharedKey, "utf16le");
    const key = crypto
      .createHash("md5")
      .update(bufferedKey)
      .digest();
    const newKey = Buffer.concat([key, key.slice(0, 8)]);
    const IV = Buffer.alloc(8, "\0");
    const cipher = crypto
      .createDecipheriv("des-ede3-cbc", newKey, IV)
      .setAutoPadding(true);
    return cipher.update(cipherText, "base64", "utf8") +
    cipher.final("utf8");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

function decryptData(encryptedData) {
  let rawData = decrypt(config.crypt_key, JSON.stringify(encryptedData));
  let trimmedDated = rawData.split("").filter(function(e) {
      return e != "\u0000";
  });
  rawData = trimmedDated.join('');

  return JSON.parse(rawData);
}
module.exports = { encrypt, decrypt, decryptData };