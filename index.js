require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const github = require('./cloud_apps/github_handler');
const zendesk = require('./cloud_apps/zendesk_handler');
const jira = require('./cloud_apps/jira/handler');

const app = express();
app.use(cors({origin: 'http://localhost:8065', credentials: true}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', ((req, res) => {
    res.send('Thanks!');
}));

const githubRouter = new express.Router();
github.routes(githubRouter);
app.use('/github', githubRouter);

const zendeskRouter = new express.Router();
zendesk.routes(zendeskRouter);
app.use('/zendesk', zendeskRouter);

const jiraRouter = new express.Router();
jira.routes(jiraRouter);
app.use('/jira', jiraRouter);

app.listen(4000, () => console.log('Listening'));
