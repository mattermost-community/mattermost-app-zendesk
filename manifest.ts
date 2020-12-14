const manifest: any = {
    app_id: 'zendesk',
    display_name: 'Zendesk',
    description: 'Zendesk cloud app for Mattermost',
    root_url: 'https://jasonf.ngrok.io',
    requested_permissions: ['act_as_user', 'act_as_bot'],
    oauth2_callback_url: 'https://jasonf.ngrok.io/oauth2/complete',
    homepage_url: 'https://github.com/mattermost/mattermost-app-zendesk',
    requested_locations: ['/post_menu', '/channel_header', '/command', '/in_post'],
};

export default manifest;
