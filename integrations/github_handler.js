module.exports.routes = (router) => {
    router.get('/', (req, res) => {
        res.send('GitHub!');
    });

    router.post('/repos', (req, res) => {
        const text = req.body.text;
        const ls = repos.filter((repo) => repo.includes(text)).map((repo) => ({
            text: repo,
            value: repo,
        }));
        res.json({items: ls});
    });

    router.post('/issues', (req, res) => {
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
        console.log(text);
        res.json({items: ls});
    });

    router.post('/callback', (req, res) => {
        console.log(req.body);

        if (req.body.type === 'dialog_submission') {
            console.log('Dialog submitted!');
        } else if (req.body.type === 'dialog_select') {
            const {name, value, values, elements} = req.body;

            if (name === 'repo') {
                values.issue = '';

                const repo = value;
                const issues = issues.filter((issue) => issue.repo === repo && issue.title.toLowerCase().includes(text)).map((issue) => ({
                    text: issue.title,
                    value: issue.title,
                }));
            }

            res.json({
                elements,
                values: {
                    ...values,
                    [name]: value,
                },
            });
            return;
        }

        res.send('Done');
    });
};

module.exports.getDialogConfig = (trig) => {
    const body = {
        "trigger_id": trig,
        url: 'http://localhost:4000/github/callback',
        "dialog": {
            "callback_id": 'bbb',
            "title": 'GitHub Issue Search',
            "introduction_text": '',
            "elements": [
                {
                    "display_name": "Repo",
                    "name": "repo",
                    "type": "select",
                    "subtype": "dynamic",
                    "placeholder": "",
                    optional: false,
                    data_source: "http://localhost:4000/github/repos",
                    dispatch_on_change: true,
                },
                {
                    "display_name": "Issue",
                    "name": "issue",
                    "type": "select",
                    "subtype": "dynamic",
                    "placeholder": "",
                    depends_on: 'repo',
                    optional: false,
                    data_source: "http://localhost:4000/github/issues"
                },
                {
                    "display_name": "Description",
                    "name": "description",
                    "type": "textarea",
                    "default": "The posts's body.",
                },
            ],
            "submit_label": 'Create Issue',
            "notify_on_cancel": false,
            "state": 'THE STATE',
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
