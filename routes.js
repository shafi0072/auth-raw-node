const { sampleHandler } = require("./handlers/routeHandler/sampleHandler");
const { notFound } = require("./handlers/routeHandler/notFoundHandler");
const { userHandler } = require("./handlers/routeHandler/userHandler");
const { tokenHandler } = require("./handlers/routeHandler/tokenHandler");
const { checkHandler } = require("./handlers/routeHandler/checkHandler");
const routes = {
  'sample': sampleHandler,
  'user': userHandler,
  'token': tokenHandler,
  'check': checkHandler,
};

module.exports = routes;
