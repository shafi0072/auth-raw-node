const crypto = require("crypto");
const utilities = {};

// parse JSON string to boject
utilities.parseJSON = (jsonString) => {
  let output;
  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }
  return output;
};

// hash string
utilities.hashString = (str) => {
  if (typeof str === "string" && str.length > 0) {
    let hash = crypto
      .createHmac("sha256", process.env.hash_config)
      .update(str)
      .digest(`hex`);
    return hash;
  } else {
    return false;
  }
};
// create random string
utilities.createRandomString = (strlength) => {
  let length = strlength;
  length = typeof strlength === "number" && strlength > 0 ? strlength : null;

  if (length) {
    let possibleCharacters = "abcdefghijklmnopqrstuvwxyz123456789";
    let output = "";
    for (let i = 1; i <= length; i++) {
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      output += randomCharacter;
    }
    return output;
  } else {
    return false;
  }
};
module.exports = utilities;
