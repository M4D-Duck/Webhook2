const express = require('express');
const body_paser = require('body-parser');
const axios = require('axios');
require('dotenv').config()

const app = express().use(body_paser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

app.listen(8000 || process.env.PORT, () => {
    console.log('Webhook is listening');
});

app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let challenge = req.query['hub.challenge'];
    let token = req.query['hub.verify_token'];



    if (mode && token) {

        if (mode === 'subscribe' && token === mytoken) {
            res.status(200).send(challenge);
        } else {
            res.status(403);
        }
    }
});


app.post('/webhook', (req, res) => {
    let body = req.body;
    console.log(JSON.stringify(body, null, 2));

    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.message && body.entry[0].changes[0].value.message[0]) {
            let phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body.entry[0].changes[0].value.messages[0].from;
            let msg_body = body.entry[0].changes[0].value.messages[0].text.body;

            axios({
                method: 'POST',
                url: 'https://graph.facebook.com/v17.0/' + phone_number_id + '/messages?access_token=' + token,
                data: {
                    messaging_product: 'whatsapp',
                    to: from,
                    text: {
                        body: 'Hello... This is a message from Cris'
                    }
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    }
});