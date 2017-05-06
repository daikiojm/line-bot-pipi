'use strict';

const https = require('https');
const rp = require("request-promise");

let send = (data, callback) => {
  let body = JSON.stringify(data);

  let req = https.request({
    hostname: "api.line.me",
    port: 443,
    path: "/v2/bot/message/reply",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "Authorization": "Bearer " + process.env.CHANNEL_ACCESS_TOKEN
    }
  });

  req.end(body, (err) => {
    err && console.log(err);
    callback(err);
  });
}

exports.linebot = (event, context, callback) => {
  // parse line msg body
  let body = JSON.parse(event.body);
  console.log(body.events[0].source);
  console.log(body.events[0].message);
  let result = body.events && body.events[0];
  if (result) {
    let content = body.events[0] || {};
    // call zatudan api
    let ctx = content.source.userId;
    let options = { method: 'POST',
      url: 'https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue',
      qs: { APIKEY: process.env.APIKEY },
      headers:
       { 'cache-control': 'no-cache',
         'content-type': 'application/json' },
      body: { utt: content.message.txt, context: ctx, t: 20 },
      json: true };

    // promise
    rp(options)
      .then((parsedBody) => {
        console.log(parsedBody);
        // make reply text
        let reply_text = parsedBody.utt || "get message error.";
        let message = {
          "replyToken":result.replyToken,
          "messages": [
            {
              "type": "text",
              "text": reply_text
            }
          ]
        };
        send(message, () => {
        callback(null, {statusCode: 200, body: JSON.stringify({})});
      });
    })
      .catch((err) => {
        console.log(err);
      });
    } else {
      callback(null, {statusCode: 400, body: JSON.stringify({})});
    }
};
