const app = require('../app/app')

module.exports.routes = (router) => {
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
};
