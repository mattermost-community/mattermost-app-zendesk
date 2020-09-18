const express = require('express');

const utils = require('../../util');
const Client4 = require('../../client');

const lookup = require('./lookup');
const form = require('./create_issue_form');

module.exports.routes = (router) => {
    router.get('/', (req, res) => {
        res.send('Jira Integration!');
    });

    const lookupRouter = new express.Router();
    lookup.routes(lookupRouter);
    router.use('/lookup', lookupRouter);

    form.routes(router);

    router.get('/ui_components', (req, res) => {
        res.json([
            {
                id: 'jira',
                location: 'POST_ACTION',
                request_url: 'http://localhost:4000/jira/wishes/create_issue_from_post',
                scope: ['webapp'],
                extra: {
                    icon: JIRA_ICON_DATA,
                    text: 'Create Jira Issue',
                },
            },
        ]);
    });
};
