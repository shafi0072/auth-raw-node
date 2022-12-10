const https = require("https");
const queryString = require("querystring");
const notification = {};

notification.sendTwilioSms = (phone, msg, callback) => {
  // input validation
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && userMsg) {
    // configure the request payload
    const payload = {
      From: process.env.twilio_from_phone,
      To: `+88${userPhone}`,
      Body: userMsg,

    };

    // stringify payload
    const strigifyPayload = JSON.stringify(payload);

    // configure the request details
    const requestDetailsObject = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${process.env.accountSid}/Messages.json`,
      auth: `${process.env.accountSid}:${process.env.twilio_token}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    // instancetiate the request object
    const req = https.request(requestDetailsObject, (res) => {
      // get the status  of the sent request
      const status = res.statusCode;
      // callback successfully if the request wen through
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`status code returen was ${status}`);
      }
    });
    req.on("error", (err) => {
      callback(err);
    });
    req.write(strigifyPayload);
    req.end();
  } else {
    callback("please add phone number or message");
  }
};

module.exports = notification;
