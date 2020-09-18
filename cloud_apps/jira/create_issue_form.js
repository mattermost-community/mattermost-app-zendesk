const express = require('express');

const utils = require('../../util');
const Client4 = require('../../client');

module.exports.routes = (router) => {
    router.post('/wishes/create_issue_from_post', async (req, res) => {
        console.log('/create_issue_from_post', req.body);

        let post;
        try {
            post = await Client4.getPost(req.body.values.post_id);
        } catch (e) {
            console.error(e);
            return res.json({});
        }

        utils.openInteractiveDialog(makeDialogConfig(req.body.trigger_id, post));
        res.json({});
    });

    router.post('/event', (req, res) => {
        console.log('/event', req.body);

        if (req.body.type === 'dialog_submission') {
           return res.json(handleFormSubmission(req.body));
        }

        const {name, value, values, elements, state} = req.body;
        if (name === 'instance') {
            return res.json(handleInstanceSelected(req.body));
        }

        if (name === 'project') {
            return res.json(handleProjectSelected(req.body));
        }

        if (name === 'issue_type') {
            return res.json(handleIssueTypeSelected(req.body));
        }

        res.json({
            elements,
            values: {
                ...values,
                [name]: value,
            },
        });
    });
};

const handleFormSubmission = (payload) => {
    console.log(payload);
    const {summary, post_id} = payload.submission;
    const {channel_id, user_id, state} = payload;

    const post = JSON.parse(state).post;
    const message = `Created a new ticket!\n[${summary}](fakelink.com)`;

    // return {errors: {mattermost_assignee: 'Selected user does not have their Jira account connected'}};

    Client4.createPost({
        message,
        channel_id,
        user_id,
        root_id: post.id,
    })

    return {};
}

const handleInstanceSelected = (payload) => {
    if (!payload.value) {
        return {error: 'Instance cannot be cleared'};
    }

    const post = JSON.parse(payload.state).post;
    return {
        elements: [
            makeInstanceElement(),
            makeProjectElement(),
        ],
        values: {
            instance: payload.value,
            project: '',
            description: post.message,
        },
    };
};

const handleProjectSelected = (payload) => {
    const post = JSON.parse(payload.state).post;
    if (!payload.value) {
        return {
            elements: [
                makeInstanceElement(),
                makeProjectElement(),
            ],
            values: {
                instance: payload.value,
                project: '',
                description: post.message,
            },
        };
    }

    payload.values.project = payload.value;
    const elements = [
        makeInstanceElement(),
        makeProjectElement(),
        makeIssueTypeElement(payload),
    ];

    return {
        elements,
        values: {
            ...payload.values,
            issue_type: '',
            description: post.message,
        },
    };
};

const handleIssueTypeSelected = (payload) => {
    const post = JSON.parse(payload.state).post;
    if (!payload.value) {
        return {
            elements: [
                makeInstanceElement(),
                makeProjectElement(),
                makeIssueTypeElement(payload),
            ],
            values: {
                instance: payload.values.instance,
                project: payload.values.project,
                issue_type: '',
                description: payload.values.description || post.message,
            },
        };
    }

    payload.values.issue_type = payload.value;
    const otherElements = makeFieldsElements(payload);

    const elements = [
        makeInstanceElement(),
        makeProjectElement(),
        makeIssueTypeElement(payload),
        ...otherElements,
    ];

    return {
        elements,
        values: {
            ...payload.values,
            description: payload.values.description || post.message,
        },
    };
};

const makeInstanceElement = () => {
    return {
        display_name: 'Instance',
        name: 'instance',
        type: 'select',
        subtype: 'dynamic',
        optional: false,
        data_source: 'http://localhost:4000/jira/lookup/instances',
        dispatch_on_change: true,
    };
};

const makeProjectElement = () => {
    return {
        display_name: 'Project',
        name: 'project',
        type: 'select',
        subtype: 'dynamic',
        optional: false,
        data_source: 'http://localhost:4000/jira/lookup/projects',
        dispatch_on_change: true,
        depends_on: 'instance',
    };
};

const makeIssueTypeElement = (payload) => {
    const issueTypes = [
        {text: 'Story', value: 'Story'},
        {text: 'Task', value: 'Task'},
        {text: 'Bug', value: 'Bug'},
    ];

    return {
        display_name: 'Issue Type',
        name: 'issue_type',
        type: 'select',
        optional: false,
        options: issueTypes,
        dispatch_on_change: true,
        depends_on: 'project',
    };
};

const makeFieldsElements = (payload) => {
    const assignees = [
        utils.makeOption('User One'),
        utils.makeOption('User Two'),
        utils.makeOption('User Three'),
        utils.makeOption('User Four'),
        utils.makeOption('User Five'),
    ];

    const teams = makeTeams();
    const assigneeElement = {
        display_name: 'Jira Assignee',
        name: 'assignee',
        type: 'select',
        subtype: 'dynamic',
        optional: false,
        data_source: 'http://localhost:4000/jira/lookup/assignees',
        depends_on: 'issue_type',
    };

    const mattermostAssigneeElement = {
        display_name: 'Mattermost Assignee',
        name: 'mattermost_assignee',
        type: 'select',
        optional: false,
        data_source: 'users',
    };

    const elements = [
        {display_name: 'Summary', name: 'summary', required: true, type: 'text'},
        {display_name: 'Description', name: 'description', required: true, type: 'textarea'},
        assigneeElement,
        mattermostAssigneeElement,
        {display_name: 'Mattermost Team', name: 'mattermost_team', required: false, type: 'select', options: teams},
        {display_name: 'QA Test Steps', name: 'qa_test_steps', required: false, type: 'textarea'},
    ]

    return elements.map((e) => ({...e, optional: !e.required}));
};

const makeDialogConfig = (triggerID, post) => {
    const stage = 'SELECT_INSTANCE';
    const state = JSON.stringify({stage, post});

    const body = {
        trigger_id: triggerID,
        url: 'http://localhost:4000/jira/event',
        dialog: {
            callback_id: 'CALLBACK_ID',
            title: 'Create Jira Issue',
            introduction_text: '',
            submit_label: 'Create Issue',
            notify_on_cancel: false,
            state,
            elements: [makeInstanceElement()],
        }
    };

    return body;
}

const makeTeams = () => {
    return utils.makeOptions([
        'Core Features', 'Cloud Features', 'Cloud Platform', 'Cloud SRE', 'Enterprise', 'Integrations', 'Mobile', 'QA', 'Security', 'Server', 'Sustained Engineering', 'Tech Writing', 'Toolkit', 'UX', 'Web Platform', 'Workflows', 'Unassigned', 'OCTO', 'ABC', 'Platform'
    ]);
}
