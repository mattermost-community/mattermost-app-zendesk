const fs = require('fs');

const express = require('express');

const utils = require('../utils/util');
const app = require('../app/app');
const http = require('../app/http');

const router = new express.Router();

router.get('/', (req, res) => {
    res.send('Matterost!');
});

router.post('/post', async (req, res) => {
    const post = await Client4.getPost(req.body.values.post_id);
    utils.openInteractiveDialog(getDialogConfig(req.body.trigger_id, post));
    res.json({});
});

router.post('/submission', async (req, res) => {
    const {subject, description, type, post_id} = req.body.submission;
    const {channel_id, user_id} = req.body;

    const ticket = {
        ticket: {
            type,
            subject,
            comment: {
                body: description,
            },
        },
    };

    app.createTicketFromPost(ticket, channel_id, user_id, post_id);
});

router.get('/mattermost-app.json', (req, res) => {
    fs.readFile('manifest.json', (err, data) => {
        if (err) {
            throw err;
        }
        const manifest = JSON.parse(data);
        res.json(manifest);
    });
});

router.get('/install', (req, res) => {
    http.installApp();
    const manifest = '/install post';
    res.send(manifest);
});

router.post('/trigger/create', async (req, res) => {
    client.triggers.create();
});

router.post('/notify/user_left_channel', async (req, res) => {
    // const post = await Client4.getPost(req.body.values.post_id);
    console.log('req', req);
    res.send('user XXX left channel XXX');

    // res.json({"user XXX join the channel"});
});

router.post('/notify/user_joined_channel', async (req, res) => {
    // const post = await Client4.getPost(req.body.values.post_id);
    console.log('req', req);
    res.send('user XXX joined channel XXX');
    res.json({});
});

module.exports = router;
