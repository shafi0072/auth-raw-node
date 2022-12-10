const handler = {};

handler.notFound = (requestProperties, callback) => {
  console.log(requestProperties);
  callback(404, {
    message: "not found",
  });
};

module.exports = handler;
