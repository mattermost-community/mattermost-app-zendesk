const manifest: any = {
    app_id: 'zendesk',
    display_name: 'Zendesk',
    description: 'Zendesk cloud app for Mattermost',
    root_url: 'http://localhost:4000',
    requested_permissions: ['act_as_user', 'act_as_bot'],
    oauth2_callback_url: 'http://localhost:4000/oauth2/complete',
    homepage_url: 'https://github.com/mattermost/mattermost-app-zendesk',
};

export default manifest;
