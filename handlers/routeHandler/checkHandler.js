const data = require("../../lib/data");
const { parseJSON, createRandomString } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const handler = {};
handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
  // validate inputs
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  let successCode =
    typeof requestProperties.body.successCode === "object" &&
    requestProperties.body.successCode instanceof Array
      ? requestProperties.body.successCode
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCode && timeoutSeconds) {
    const token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    // check the user phone by token
    data.read("token", token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = parseJSON(tokenData).phone;
        // check the user data
        data.read("users", userPhone, (err, userData) => {
          if (!err && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                const userObject = parseJSON(userData);
                const userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                if (userChecks.length < process.env.check_length) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone: userPhone,
                    protocol: protocol,
                    url: url,
                    method: method,
                    successCode: successCode,
                    timeoutSeconds: timeoutSeconds,
                  };

                  // save object
                  data.create("check", checkId, checkObject, (err) => {
                    if (!err) {
                      // add check id to the users object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      // save new data
                      data.update("users", userPhone, userObject, (err) => {
                        if (!err) {
                          // return data
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            err: "falied to update checks",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: "internal server error",
                      });
                    }
                  });
                }
              } else {
                callback(401, {
                  error: "user has already reached max check limit!",
                });
              }
            });
          } else {
            callback(403, {
              error: "user was not found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication failed",
        });
      }
    });
  } else {
    callback(400, {
      error: "please fill the valid input",
    });
  }
};

handler._check.get = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : null;
  if (id) {
    // check for db check
    data.read("check", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, parseJSON(checkData));
            } else {
              callback(400, {
                error: "please enter the valid token in header",
              });
            }
          }
        );
      } else {
        callback(400, {
          error: "could not find the check data",
        });
      }
    });
  } else {
    callback(400, {
      error: "please enter the id as a query",
    });
  }
};
handler._check.put = (requestProperties, callback) => {
  let id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length > 20
      ? requestProperties.body.id
      : false;

  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  let successCode =
    typeof requestProperties.body.successCode === "object" &&
    requestProperties.body.successCode instanceof Array
      ? requestProperties.body.successCode
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCode || timeoutSeconds) {
      data.read("check", id, (err, checkData) => {
        if (!err && checkData) {
          let checkObject = parseJSON(checkData);
          const token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;

          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if(protocol){
                  checkObject.protocol = protocol;
                }
                if(url){
                  checkObject.url = url;
                }
                if(method){
                  checkObject.method = method;
                }
                if(successCode){
                  checkObject.successCode = successCode;
                }
                if(timeoutSeconds){
                  checkObject.successCode = successCode;
                }

                // store check object

                data.update('check', id, checkObject ,(err) => {
                  if(err){
                    callback(200,{
                      message:"update the check successful"
                    })
                  }else{
                    callback(500,{
                      error:"failed to update"
                    })
                  }
                })
              }
              else{
                callback(400,{
                  error:'Authentication failed! please add the valid token'
                })
              }
            }
          );
        } else {
          callback(500, {
            error: "the data is not found",
          });
        }
      });
    } else {
      callback(400, {
        error: "you must need to provide at least one field to update",
      });
    }
  } else {
    callback(400, {
      error: "please add the valid check id",
    });
  }
};
handler._check.delete = (requestProperties, callback) => {};

module.exports = handler;
