require("dotenv").config();
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const { sendTwilioSms } = require("./helpers/notification");
const data = require("./lib/data");

const app = {};

// testing file system
// @TODO
// data.delete("test", "newFile", (err) => {
//   console.log(err);
// });

// @todo remove later
sendTwilioSms('01763740664','hello world',(err) => {
  console.log(err);
})
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(process.env.port, () => {
    console.log(`listening to port number ${process.env.port}`);
  });
};
app.handleReqRes = handleReqRes;
app.createServer();
