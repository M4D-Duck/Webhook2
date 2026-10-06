const express = require('express');
const body_parser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(body_parser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

const PORT = process.env.PORT || 8000;


// ========================================
// SERVIDOR
// ========================================

app.listen(PORT, () => {
    console.log(`Webhook is listening on port ${PORT}`);
});


// ========================================
// VERIFICACIÓN DEL WEBHOOK
// ========================================

app.get('/webhook', (req, res) => {

    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = req.query['hub.verify_token'];

    console.log('Webhook verification request received');

    if (mode === 'subscribe' && verifyToken === mytoken) {
        console.log('Webhook verified successfully');
        return res.status(200).send(challenge);
    }

    console.log('Webhook verification failed');
    return res.sendStatus(403);
});


// ========================================
// RECIBIR MENSAJES
// ========================================

app.post('/webhook', async (req, res) => {

    const body = req.body;

    console.log('Incoming webhook:');
    console.log(JSON.stringify(body, null, 2));

    // Verificar que sea un evento de WhatsApp
    if (body.object !== 'whatsapp_business_account') {
        return res.sendStatus(404);
    }

    try {

        const value = body.entry?.[0]?.changes?.[0]?.value;

        // Verificar que exista un mensaje
        if (!value?.messages?.[0]) {
            console.log('Webhook received, but no message was found.');
            return res.sendStatus(200);
        }

        const message = value.messages[0];

        const phone_number_id = value.metadata.phone_number_id;
        const from = message.from;

        // Solo procesamos mensajes de texto
        if (message.type !== 'text') {
            console.log(`Message type "${message.type}" is not supported.`);
            return res.sendStatus(200);
        }

        const msg_body = message.text.body;

        console.log(`Message received from ${from}: ${msg_body}`);

        // ========================================
        // RESPONDER POR WHATSAPP
        // ========================================

        const response = await axios({
            method: 'POST',

            url:
                `https://graph.facebook.com/v17.0/${phone_number_id}/messages` +
                `?access_token=${token}`,

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

        console.log('WhatsApp API response:');
        console.log(response.data);

        return res.sendStatus(200);

    } catch (error) {

        console.error('Error processing webhook:');

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }

        return res.sendStatus(500);
    }
});

