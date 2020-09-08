const fetch = require('node-fetch');

const utils = require('../util');
const Client4 = require('../client');

module.exports.routes = (router) => {
    router.get('/', (req, res) => {
        res.send('ZenDesk!');
    });

    router.post('/post', async (req, res) => {
        console.log('/post', req.body);
        const post = await Client4.getPost(req.body.values.post_id);
        utils.openInteractiveDialog(getDialogConfig(req.body.trigger_id, post));
        res.json({});
    });

    router.post('/webhook', (req, res) => {
        console.log('/webhook', req.body);
        res.send('nice');
    });

    router.post('/submission', async (req, res) => {
        console.log('submission', req.body);

        const {subject, description, type, post_id} = req.body.submission;
        const {channel_id, user_id} = req.body;

        const ticket = {
            type: type,
            subject: subject,
            comment: {body: description},
        };

        const t = await createTicket(ticket);

        const host = process.env.ZENDESK_URL;
        const message = `Created a new ticket! [${subject}](${host}/agent/tickets/${t.ticket.id})`;

        const pRes = await Client4.createPost({
            message,
            channel_id,
            user_id,
            root_id: post_id,
        })

        res.json({});
    });
};

const createTicket = async (ticket) => {
    const username = process.env.ZENDESK_USERNAME;
    const token = process.env.ZENDESK_API_TOKEN;
    const auth = '/token:' + token;
    const encoded = Buffer.from(username + auth).toString('base64');

    const opts = {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + encoded,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ticket}),
    };

    const r = await fetch(`${process.env.ZENDESK_URL}/api/v2/tickets.json`, opts);
    return r.json();
}

const getDialogConfig = (triggerID, post) => {
    const body = {
        trigger_id: triggerID,
        url: 'http://localhost:4000/zendesk/submission',
        dialog: {
            callback_id: 'zendesk_callback_id',
            title: 'Create Zendesk Ticket',
            introduction_text: '',
            elements: [
                {
                    display_name: 'Type',
                    type: 'select',
                    name: 'type',
                    default: 'problem',
                    options: [
                        {
                            text: 'Problem',
                            value: 'problem',
                        },
                        {
                            text: 'Incident',
                            value: 'incident',
                        },
                        {
                            text: 'Question',
                            value: 'question',
                        },
                        {
                            text: 'Task',
                            value: 'task',
                        },
                    ]
                },
                {
                    display_name: 'Ticket Subject',
                    name: 'subject',
                    type: 'text',
                },
                {
                    display_name: 'Ticket Description',
                    name: 'description',
                    type: 'textarea',
                    default: post.message,
                },
                {
                    display_name: 'Post ID',
                    name: 'post_id',
                    type: 'hidden',
                    default: post.id,
                },
            ],
            submit_label: 'Create Ticket',
            notify_on_cancel: false,
            state: 'THE STATE',
        }
    };

    return body;
}
