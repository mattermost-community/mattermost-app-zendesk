const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');

const github = require('./integrations/github_handler');
const zendesk = require('./integrations/zendesk_handler');

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', ((req, res) => {
    res.send('Yo!');
}));

app.get('/hello', ((req, res) => {
    res.json({
        items: [
            {text: 'Remote Option 1', value: 'opt-1'},
            {text: 'Remote Option 2', value: 'opt-2'},
        ],
    });
}));

app.post('/autocomplete', ((req, res) => {
    const text = req.body.text;
    console.log(req.body);
    res.json({
        items: [
            {text: 'Remote Option 1', value: 'opt-1'},
            {text: 'Remote Option 2', value: 'opt-2'},
            {text: 'This ' + text, value: 'YEP'},
        ],
    });
}));

const router = new express.Router();
github.routes(router);
app.use('/github', router);
zendesk.routes(router);
app.use('/zendesk', router);

const openInteractiveDialog = async (trig) => {
    const host = 'http://localhost:8065';
    const u = `${host}/api/v4/actions/dialogs/open`;
    const body = {
        "trigger_id": trig,
        url: 'http://localhost:4000/callback',
        "dialog": {
            "callback_id": 'bbb',
            "title": 'The one title',
            "introduction_text": 'Hello my name is Dialog',
            "elements": [
                {
                    "display_name": "Email",
                    "name": "email",
                    "type": "text",
                    "subtype": "email",
                    "placeholder": "placeholder@example.com",
                    optional: true,
                },

                {
                    "display_name": "Static",
                    "name": "static",
                    "type": "select",
                    "placeholder": "",
                    "subtype": "dynamic",
                    optional: false,
                },
                {
                    "display_name": "Special",
                    "name": "special",
                    "type": "select",
                    "subtype": "dynamic",
                    "placeholder": "",
                    depends_on: 'static',
                    optional: true,
                },
                {
                    "display_name": "Dynamic",
                    "name": "dynamic",
                    "type": "select",
                    "subtype": "dynamic",
                    "placeholder": "",
                    optional: true,
                    data_source: "http://localhost:4000/autocomplete"
                },
            ],
            "submit_label": 'The submit label',
            "notify_on_cancel": false,
            "state": 'THE STATE',
        }
    };

    const body2 = github.getDialogConfig(trig);

    const res = await fetch(u, {method: 'POST', body: JSON.stringify(body2)}).then(r => r.json());
    console.log(res);
}

app.post('/callback', (req, res) => {
    console.log(req.body);

    if (req.body.type === 'dialog_submission') {
        console.log('Dialog submitted!');
    } else if (req.body.type === 'dialog_select') {
        res.json({
            elements: req.body.elements,
            values: {
                ...req.body.values,
                [req.body.name]: req.body.value,
            },
        });
        return;
    }

    res.send('Done');
});

app.post('/dialog', ((req, res) => {
    const trig = req.body.trigger_id;
    openInteractiveDialog(trig);
    res.send('Tools');
}));

app.listen(4000, () => console.log('Listening'));
