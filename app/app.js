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
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS USERS (user_id TEXT, user_name TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS VERSION (db_version INT)");
    db.run("CREATE TABLE IF NOT EXISTS GROUPS (group_id TEXT, group_type TEXT)");
    var sqlStr = "SELECT db_version FROM VERSION";
    db.get(sqlStr, function (err, row) {
        db.serialize(function () {
            var old_db_version = 0;
            if (row) {
                old_db_version = row.db_version;
                console.log("old_db_version: " + old_db_version);
            } else {
                db.run("INSERT INTO VERSION (db_version) VALUES (0)");
            }
            var new_db_version = old_db_version;
            switch (old_db_version) {
                case 0:
                    db.run("ALTER TABLE USERS ADD COLUMN group_id TEXT DEFAULT '0'");
                    new_db_version++;
            }
            if (old_db_version != new_db_version) {
                db.run("UPDATE VERSION SET db_version = " + new_db_version + " WHERE db_version = " + old_db_version + " ");
            }
            console.log("DB Version: " + old_db_version + " -> " + new_db_version);
            sqlStr = "SELECT * FROM USERS";
            db.each(sqlStr, function (err, row) {
                if (row) {
                    console.log(row.user_id + ": " + row.user_name + ", " + row.group_id);
                }
            });
            sqlStr = "SELECT * FROM GROUPS";
            db.each(sqlStr, function (err, row) {
                if (row) {
                    console.log(row.group_id + ": " + row.group_type);
                }
            });
        });
    });
});

app.get('/learning-line-bot', (req, res) => {
    res.send('It\'s Work!');
});

app.get('/learning-line-bot/webhook', (req, res) => {
    res.send('It\'s Work, linebot!');
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
    //join a group or a room
    if (event.type == 'join') {
        const groupType = event.source.type;
        var groupId = event.source.groupId;
        if (!groupId) groupId = event.source.roomId;
        var insertSQL = "INSERT INTO GROUPS (group_id, group_type) VALUES (?,?)";
        db.run(insertSQL, [groupId, groupType]);
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'Hello everyone! This group id is: ' + groupId
        });
    }
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    /*return client.replyMessage(event.replyToken, {
        type: 'text',
        text: event.message.text
    });*/
    return Promise.resolve(null);
}

app.listen(PORT);

var userSQLStr = "SELECT * FROM USERS";
var groupSQLStr = "SELECT * FROM USERS";
let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 5)];
rule.hour = 8;
rule.minute = 30;
rule.tz = 'Asia/Taipei';
let job = schedule.scheduleJob(rule, () => {
    db.each(userSQLStr, function (err, row) {
        if (row) {
            const message = {
                type: 'text',
                text: '早安 ' + row.user_name + ', 現在時間上午8點30分！'
            };
            client.pushMessage(row.user_id, message);
        }
    });
    db.each(groupSQLStr, function (err, row) {
        if (row) {
            const message = {
                type: 'text',
                text: '大家早安! 現在時間上午8點30分！'
            };
            client.pushMessage(row.group_id, message);
        }
    });
});

let rule2 = new schedule.RecurrenceRule();
rule2.dayOfWeek = [0, new schedule.Range(1, 5)];
rule2.hour = 19;
rule2.minute = 0;
rule2.tz = 'Asia/Taipei';
let job2 = schedule.scheduleJob(rule2, () => {
    db.each(userSQLStr, function (err, row) {
        if (row) {
            const message = {
                type: 'text',
                text: '晚安 ' + row.user_name + ', 現在時間晚上7點整！'
            };
            client.pushMessage(row.user_id, message);
        }
    });
    db.each(groupSQLStr, function (err, row) {
        if (row) {
            const message = {
                type: 'text',
                text: '大家晚安! 現在時間晚上7點整！'
            };
            client.pushMessage(row.group_id, message);
        }
    });
});
