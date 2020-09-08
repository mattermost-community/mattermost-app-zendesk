const utils = require('../util');
const Client4 = require('../client');

module.exports.routes = (router) => {
    router.get('/', (req, res) => {
        res.send('GitHub!');
    });

    router.post('/post', async (req, res) => {
        console.log('/post', req.body);
        const post = await Client4.getPost(req.body.values.post_id);

        utils.openInteractiveDialog(getDialogConfig(req.body.trigger_id, post));
        res.json({});
    });

    router.post('/repos', (req, res) => {
        console.log('/repos', req.body);
        const text = req.body.text;
        const ls = repos.filter((repo) => repo.includes(text)).map((repo) => ({
            text: repo,
            value: repo,
        }));
        res.json({items: ls});
    });

    router.post('/issues', (req, res) => {
        console.log('/issues', req.body);
        const repo = req.body.form.repo;
        if (!repo) {
            res.json([]);
            return;
        }

        const text = req.body.text;
        const ls = issues.filter((issue) => issue.repo === repo && issue.title.toLowerCase().includes(text)).map((issue) => ({
            text: issue.title,
            value: issue.title,
        }));
        res.json({items: ls});
    });

    router.post('/callback', (req, res) => {
        console.log('/callback', req.body);

        if (req.body.type === 'dialog_submission') {
            console.log('Dialog submitted!');
            res.send({});
            return;
        } else if (req.body.type === 'dialog_select') {
            const {name, value, values, elements} = req.body;

            if (name === 'repo') {
                values.issue = '';
                values.issue_static = '';

                const repo = value;
                const ls = issues.filter((issue) => issue.repo === repo).map((issue) => ({
                    text: issue.title,
                    value: issue.title,
                }));

                elements.find((el) => el.name === 'issue_static').options = ls;
            }

            const i = elements.length - 4;
            elements.push({
                display_name: 'Extra Element ' + i,
                name: 'extra' + i,
                type: 'text',
                placeholder: '',
                optional: false,
            });

            res.json({
                elements,
                values: {
                    ...values,
                    [name]: value,
                },
            });
            return;
        }

        const s = `Unknown action ${req.body.type}`;
        console.log(s);
        res.send(s);
    });
};

const getDialogConfig = (triggerID, post) => {
    const body = {
        trigger_id: triggerID,
        url: 'http://localhost:4000/github/callback',
        dialog: {
            callback_id: 'bbb',
            title: 'GitHub Issue Search',
            introduction_text: '',
            submit_label: 'Create Issue',
            notify_on_cancel: false,
            state: 'THE STATE',
            elements: [
                {
                    display_name: 'Repo',
                    name: 'repo',
                    type: 'select',
                    subtype: 'dynamic',
                    optional: false,
                    data_source: 'http://localhost:4000/github/repos',
                    dispatch_on_change: true,
                },
                {
                    display_name: 'Issue',
                    name: 'issue',
                    type: 'select',
                    subtype: 'dynamic',
                    optional: false,
                    data_source: 'http://localhost:4000/github/issues',
                    fetch_once: true,
                    depends_on: 'repo',
                },

                {
                    display_name: 'Issue Static',
                    name: 'issue_static',
                    type: 'select',
                    optional: false,
                    options: [
                        {
                            text: 'Option1',
                            value: 'opt1'
                        },
                        {
                            text: 'Option2',
                            value: 'opt2'
                        },
                        {
                            text: 'Option3',
                            value: 'opt3'
                        }
                    ]
                },
                {
                    display_name: 'Description',
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
        }
    };

    return body;
}

const repos = [
    'repo-1',
    'repo-2',
];

const issues = [
    {repo: 'repo-1', title: 'First issue'},
    {repo: 'repo-1', title: 'Second issue'},
    {repo: 'repo-2', title: 'Third issue'},
    {repo: 'repo-2', title: 'Fourth issue'},
];
