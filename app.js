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
const file = './sqlite3.db';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
db.run("CREATE TABLE IF NOT EXISTS  USERS (user_id TEXT, user_name TEXT)");
var sqlStr = "SELECT * FROM USERS";
db.each(sqlStr, function (err, row) {
    console.log(row.user_id + ": " + row.user_name);
});


app.post('/webhook', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

const client = new line.Client(config);
function handleEvent(event) {
    //add as friend
    if (event.type == 'follow') {
        const userId = event.source.userId;
        client.getProfile(userId)
            .then((profile) => {
                console.log(profile.displayName);
                console.log(profile.userId);
                var insertSQL = "INSERT INTO USERS (user_id, user_name) VALUES (?,?)";
                db.run(insertSQL, [profile.userId, profile.displayName]);
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: 'Hi ' + profile.displayName + ', your user id is: ' + userId
                });
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