import {AppsBindings} from 'mattermost-redux/constants/apps';

type RequestedPermissions = 'act_as_user' | 'act_as_bot'
<<<<<<< HEAD
=======
type RequestedLocations = AppsBindings.POST_MENU_ITEM | AppsBindings.CHANNEL_HEADER_ICON | AppsBindings.COMMAND | AppsBindings.IN_POST
>>>>>>> master

export type Manifest = {
    app_id: string;
    display_name: string;
    description: string;
    root_url: string;
    requested_permissions: RequestedPermissions[];
    oauth2_callback_url: string;
    homepage_url: string;
<<<<<<< HEAD
    requested_locations: string[];
=======
    requested_locations: RequestedLocations[];
>>>>>>> master
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
<<<<<<< HEAD
        requested_locations: [AppsBindings.COMMAND, AppsBindings.CHANNEL_HEADER_ICON, AppsBindings.POST_MENU_ITEM, AppsBindings.IN_POST],
=======
        requested_locations: [AppsBindings.CHANNEL_HEADER_ICON, AppsBindings.POST_MENU_ITEM, AppsBindings.IN_POST],
>>>>>>> master
    };
    return manifest;
}
