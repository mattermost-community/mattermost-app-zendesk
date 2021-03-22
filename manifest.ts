import {AppBindingLocations, AppExpandLevels} from 'mattermost-redux/constants/apps';
import {AppCall} from 'mattermost-redux/types/apps';

import {AppID, Routes} from './src/utils';

type RequestedPermissions = 'act_as_user' | 'act_as_bot'

export type Manifest = {
    app_id: string;
    app_type: string;
    display_name: string;
    description: string;
    root_url: string;
    requested_permissions: RequestedPermissions[];
    oauth2_callback_url: string;
    homepage_url: string;
    requested_locations: string[];
    bindings: string[];
}

export function getManifest(): Manifest {
    const bindingsCall: AppCall = {
        url: Routes.App.BindingsPath,
        expand: {
            acting_user: AppExpandLevels.EXPAND_ALL,
        },
    };

    const manifest: Manifest = {
        app_id: AppID,
        app_type: 'http',
        display_name: 'Zendesk',
        description: 'Zendesk cloud app for Mattermost',
        root_url: process.env.ZD_NODE_HOST as string,
        requested_permissions: ['act_as_user', 'act_as_bot'],
        oauth2_callback_url: process.env.ZD_NODE_HOST + '/oauth2/complete',
        homepage_url: 'https://github.com/mattermost/mattermost-app-zendesk',
        requested_locations: [AppBindingLocations.COMMAND, AppBindingLocations.CHANNEL_HEADER_ICON, AppBindingLocations.POST_MENU_ITEM, AppBindingLocations.IN_POST],
        bindings: bindingsCall,
    };
    return manifest;
}
