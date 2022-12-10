const data = require("../../lib/data");
const { hashString } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const handler = {};
handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : null;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : null;

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

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean"
      ? requestProperties.body.tosAgreement
      : null;

  if (firstName && lastName && phone && password && tosAgreement) {
    // user cheking
    data.read("users", phone, (err, user) => {
      if (err) {
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hashString(password),
          tosAgreement,
        };
        // store user in db
        data.create("users", phone, userObject, (err) => {
          if (!err) {
            callback(200, {
              message: "user created successfully",
            });
          } else {
            callback(500, {
              error: "could not create user",
            });
          }
        });
      } else {
        callback(500, {
          message: "the user already exist",
        });
      }
    });
  } else {
    callback(400, {
      error:
        "please insert the valid field firstName, lastName, phone, password, tosAgreement",
    });
  }
};
handler._users.get = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : null;

  // verify token

  if (phone) {
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.read("users", phone, (err, users) => {
          const user = { ...parseJSON(users) };
          if (!err && user) {
            delete user.password;
            callback(200, user);
          } else {
            callback(404, {
              error: "not found the user",
            });
          }
        });
      } else {
        callback(403, {
          error: "not authenticated",
        });
      }
    });
    // find the user
  } else {
    callback(404, {
      error: "requested user is not found",
    });
  }
};
handler._users.put = (requestProperties, callback) => {
  // check phone number validation
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : null;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : null;

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

  if (phone) {
    if (firstName || lastName || password) {

      let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.read("users", phone, (err, users) => {
          const user = { ...parseJSON(users) };
          if (!err && user) {
            if (firstName) {
              user.firstName === firstName;
            }
            if (lastName) {
              user.lastName === lastName;
            }
            if (password) {
              user.password === hashString(password);
            }
  
            // update to database
            data.update("users", phone, user, (err) => {
              if (!err) {
                callback(200, {
                  message: "update successful",
                });
              } else {
                callback(500, {
                  error: "failed to update",
                });
              }
            });
          } else {
            callback(500, {
              error: "failed to update",
            });
          }
        });
      } else {
        callback(403, {
          error: "not authenticated",
        });
      }
    });

      // check file based on phone number
      
    } else {
      callback(400, {
        error: "empty input",
      });
    }
  } else {
    callback(400, {
      error: "invalid phone number",
    });
  }
};
handler._users.delete = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : null;
  if (phone) {
    // check the phone number
    data.read("users", phone, (err, user) => {
      if (!err && user) {
        data.delete("users", phone, (err) => {
          if (!err) {
            callback(200, {
              message: "user deleted successfully ",
            });
          } else {
            callback(500, {
              message: "failed to delete user",
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

module.exports = handler;
