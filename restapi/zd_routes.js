const app = require('../app/app')
const express = require('express');
const router = new express.Router();

router.get('/', (req, res) => {
    res.send('ZenDesk!');
});

router.post('/webhook', (req, res) => {
    app.createPostFromWebhook(req);
    res.send('nice');
});

router.post('/trigger/create', async (req, res) => {
    client.triggers.create()
});

module.exports = {
  path: app.PathZendesk,
  routes: router 
}
