const utils = require('../../util');
const JiraClient = require('./jira_api');

module.exports.routes = (router) => {
    router.post('/instances', (req, res) => {
        console.log('/lookup/instances', req.body);
        const text = req.body.text;
        const ls = instances.filter((instance) => instance.includes(text)).map((instance) => ({
            text: instance,
            value: instance,
        }));
        res.json({items: ls});
    });

    router.post('/projects', (req, res) => {
        console.log('/lookup/projects', req.body);
        const text = req.body.text;

        const {instance} = req.body.form
        const ls = projects[instance].filter((project) => project.includes(text)).map((project) => ({
            text: project,
            value: project,
        }));
        res.json({items: ls});
    });

    router.post('/assignees', async (req, res) => {
        console.log('/lookup/assignees', req.body);
        const text = req.body.text;

        const {instance, project} = req.body.form

        let assignees;
        try {
            const jira = new JiraClient(process.env.MM_BOT_TOKEN);
            assignees = await jira.assignees(instance, project, text);
        } catch (e) {
            console.error(e);
            return [];
        }

        const ls = assignees.map((user) => ({
            text: user.displayName,
            value: user.displayName,
        }));
        res.json({items: ls});
    });
};

const instances = [
    'https://mmtest.atlassian.net',
    'http://localhost:8080',
];

const projects = {
    'https://mmtest.atlassian.net': [
        'KT',
        'Testing',
    ],
    'http://localhost:8080': [
        'Local Testing',
        'Jira Server Testing',
    ],
}
