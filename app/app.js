'use strict';
const result = require('dotenv').config({ path: './data/.env' });
//if (result.error) { console.log(result.error); }
const express = require('express');
const line = require('@line/bot-sdk');
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LIEN_CHANNEL_SECRET
};
const app = express();
const PORT = process.env.PORT || 80;
const file = './data/sqlite3.db';
var sqlite3 = require('sqlite3').verbose();
const schedule = require('node-schedule');

var db = new sqlite3.Database(file);
db.run("CREATE TABLE IF NOT EXISTS  USERS (user_id TEXT, user_name TEXT)");
var sqlStr = "SELECT * FROM USERS";
db.each(sqlStr, function (err, row) {
    if (row) {
        console.log(row.user_id + ": " + row.user_name);
    }
});

app.get('/learning-line-bot', (req, res) => {
    res.send('It\'s Work!');
});

app.post('/learning-line-bot/webhook', line.middleware(config), (req, res) => {
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

app.listen(PORT);

let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 5)];
rule.hour = 9;
rule.minute = 0;
rule.tz = 'Asia/Taipei';
let job = schedule.scheduleJob(rule, () => {
    db.each(sqlStr, function (err, row) {
        if (row) {
            const message = {
                type: 'text',
                text: '早安 ' + row.user_name + ', 上班打卡啦!!!'
            };
            client.pushMessage(row.user_id, message);
        }
    });
});

let rule2 = new schedule.RecurrenceRule();
rule2.dayOfWeek = [0, new schedule.Range(1, 5)];
rule2.hour = 13;
rule2.minute = 30;
rule2.tz = 'Asia/Taipei';
let job2 = schedule.scheduleJob(rule2, () => {
    db.each(sqlStr, function (err, row) {
        if (row) {
            const message = {
                type: 'text',
                text: '午安 ' + row.user_name + ', 下午一點半啦!!!'
            };
            client.pushMessage(row.user_id, message);
        }
    });
});