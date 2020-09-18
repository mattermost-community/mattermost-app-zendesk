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

const JIRA_ICON_DATA = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNzMuMjcgNzUuNzYiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojMjY4NGZmO30uY2xzLTJ7ZmlsbDp1cmwoI2xpbmVhci1ncmFkaWVudCk7fS5jbHMtM3tmaWxsOnVybCgjbGluZWFyLWdyYWRpZW50LTIpO308L3N0eWxlPjxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyLWdyYWRpZW50IiB4MT0iMzQuNjQiIHkxPSIxNS4zNSIgeDI9IjE5IiB5Mj0iMzAuOTkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAuMTgiIHN0b3AtY29sb3I9IiMwMDUyY2MiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMyNjg0ZmYiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyLWdyYWRpZW50LTIiIHgxPSIzOC43OCIgeTE9IjYwLjI4IiB4Mj0iNTQuMzkiIHkyPSI0NC42NyIgeGxpbms6aHJlZj0iI2xpbmVhci1ncmFkaWVudCIvPjwvZGVmcz48dGl0bGU+SmlyYSBTb2Z0d2FyZS1pY29uLWJsdWU8L3RpdGxlPjxnIGlkPSJMYXllcl8yIiBkYXRhLW5hbWU9IkxheWVyIDIiPjxnIGlkPSJCbHVlIj48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik03Mi40LDM1Ljc2LDM5LjgsMy4xNiwzNi42NCwwaDBMMTIuMSwyNC41NGgwTC44OCwzNS43NkEzLDMsMCwwLDAsLjg4LDQwTDIzLjMsNjIuNDIsMzYuNjQsNzUuNzYsNjEuMTgsNTEuMjJsLjM4LS4zOEw3Mi40LDQwQTMsMywwLDAsMCw3Mi40LDM1Ljc2Wk0zNi42NCw0OS4wOGwtMTEuMi0xMS4yLDExLjItMTEuMiwxMS4yLDExLjJaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMzYuNjQsMjYuNjhBMTguODYsMTguODYsMCwwLDEsMzYuNTYuMDlMMTIuMDUsMjQuNTksMjUuMzksMzcuOTMsMzYuNjQsMjYuNjhaIi8+PHBhdGggY2xhc3M9ImNscy0zIiBkPSJNNDcuODcsMzcuODUsMzYuNjQsNDkuMDhhMTguODYsMTguODYsMCwwLDEsMCwyNi42OGgwTDYxLjIxLDUxLjE5WiIvPjwvZz48L2c+PC9zdmc+';
