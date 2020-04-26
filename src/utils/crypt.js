const crypto = require("crypto");

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
module.exports = { encrypt, decrypt };