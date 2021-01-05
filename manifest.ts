import {AppsBindings} from 'mattermost-redux/constants/apps';

type RequestedPermissions = 'act_as_user' | 'act_as_bot'

export type Manifest = {
    app_id: string;
    display_name: string;
    description: string;
    root_url: string;
    requested_permissions: RequestedPermissions[];
    oauth2_callback_url: string;
    homepage_url: string;
    requested_locations: string[];
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
        requested_locations: [AppsBindings.COMMAND, AppsBindings.CHANNEL_HEADER_ICON, AppsBindings.POST_MENU_ITEM, AppsBindings.IN_POST],
    };
    return manifest;
}
