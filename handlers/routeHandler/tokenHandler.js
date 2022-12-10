const data = require("../../lib/data");
const { hashString, parseJSON } = require("../../helpers/utilities");
const { createRandomString } = require("../../helpers/utilities");
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : null;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : null;
  if (phone && password) {
    data.read("users", phone, (err, userData) => {
      const user = parseJSON(userData);
      let hashedPassword = hashString(password);
      if (hashedPassword === user.password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone,
          id: tokenId,
          expires,
        };

        // store
        data.create("token", tokenId, tokenObject, (err) => {
          if (!err) {
            callback(200, tokenObject);
          } else {
            callback(500, {
              error: "there was a problem in the serverside",
            });
          }
        });
      } else {
        callback(400, {
          error: "please inter the valid password",
        });
      }
    });
  } else {
    callback(400, {
      error: "you have a problem with your request",
    });
  }
};
handler._token.get = (requestProperties, callback) => {
  // check the token Id
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : null;
  if (id) {
    // find the token
    data.read("token", id, (err, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, {
          error: "not found the token",
        });
      }
    });
  } else {
    callback(404, {
      error: "requested token is not found",
    });
  }
};
handler._token.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : null;
  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? true
      : null;
  if (id && extend) {
    data.read("token", id, (err, tokenData) => {
      let tokenObject = parseJSON(tokenData);
      if (tokenObject.expires > Date.now()) {
        tokenObject.expires = Date.now() + 60 * 60 * 1000;

        // store the token
        data.update("token", id, tokenObject, (err) => {
          if (!err) {
            callback(200, {
              message: "token updated",
            });
          } else {
            callback(500, {
              error: "there was a server side error",
            });
          }
        });
      } else {
        callback(400, {
          error: "token already expired",
        });
      }
    });
  } else {
    callback(400, {
      error: "server sider error",
    });
  }
};
handler._token.delete = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : null;
  if (id) {
    // check the phone number
    data.read("token", id, (err, tokenData) => {
      if (!err && tokenData) {
        data.delete("token", id, (err) => {
          if (!err) {
            callback(200, {
              message: "token deleted successfully ",
            });
          } else {
            callback(500, {
              message: "failed to delete token",
            });
          }
        });
      } else {
        callback(500, {
          error: "failed to delete",
        });
      }
    });
  } else {
    callback(400, {
      error: "failed to delete",
    });
  }
};

handler._token.verify = (id, phone, callback) => {
  data.read("token", id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phone === phone &&
        parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};
module.exports = handler;
