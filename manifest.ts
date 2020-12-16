type RequestedPermissions = 'act_as_user' | 'act_as_bot'
type RequestedLocations = '/post_menu' | '/channel_header' | '/command' | '/in_post'

export type Manifest = {
    app_id: string;
    display_name: string;
    description: string;
    root_url: string;
    requested_permissions: RequestedPermissions[];
    oauth2_callback_url: string;
    homepage_url: string;
    requested_locations: RequestedLocations[];
}

export function getManifest(): Manifest {
    const manifest: Manifest = {
        app_id: 'zendesk',
        display_name: 'Zendesk',
        description: 'Zendesk cloud app for Mattermost',
        root_url: 'https://jasonf.ngrok.io/mattermost',
        requested_permissions: ['act_as_user', 'act_as_bot'],
        oauth2_callback_url: 'https://jasonf.ngrok.io/mattermost/oauth2/complete',
        homepage_url: 'https://github.com/mattermost/mattermost-app-zendesk',
        requested_locations: ['/channel_header', '/command', '/in_post'],
    };
    return manifest;
}
