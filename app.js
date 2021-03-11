'use strict';
const result = require('dotenv').config();
if (result.error) throw result.error
const express = require('express');
const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LIEN_CHANNEL_SECRET
};

const app = express();
app.post('/webhook', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

const client = new line.Client(config);
function handleEvent(event) {
    //add as friend
    if (event.type == 'follow') {
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'your user id is: ' + event.source.userId
        });
    }
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: event.message.text
    });
}

app.listen(3000);