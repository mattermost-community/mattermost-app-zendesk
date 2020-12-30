import {AppBinding, AppCall} from 'mattermost-redux/types/apps';
import {AppsBindings, AppCallTypes, AppExpandLevels} from 'mattermost-redux/constants/apps';

import {getManifest} from '../../manifest';
import {zendeskIcon, routes, commandLocations} from '../utils';

// getBindings returns bindings defined for all locations in the app
export const getBindings = (): AppBinding[] => {
    const bindings: AppBinding = [
        postMenuBindings(),
        commandBindings(),
    ];
    return bindings;
};

// postMenuBindings returns bindings for the post_menu location
function postMenuBindings(): AppBinding {
    const binding: AppBinding = {
        location: AppsBindings.POST_MENU_ITEM,
        bindings: [
            postMenuCreate(),
        ],
    };
    return binding;
}

function postMenuCreate(): AppBinding {
    const binding: AppBinding = {
        label: 'Create Zendesk Ticket',
        description: 'Create ticket in Zendesk',
        icon: zendeskIcon,
        call: {
            url: getManifest().root_url + routes.BindingPathCreateForm,
            type: AppCallTypes.FORM,
            expand: {
                post: AppExpandLevels.EXPAND_ALL,
            },
        },
    };
    return binding;
}

// commandBindings returns bindings for the slash command location
function commandBindings(): AppBinding {
    const binding: AppBinding = {
        location: AppsBindings.COMMAND,
        bindings: [
            commandConnect(),
            commandDisconnect(),
        ],
    };
    return binding;
}

function commandConnect(): AppBinding {
    const binding: AppBinding = {
        location: commandLocations.locationConnect,
        label: 'connect',
        description: 'Connect your Zendesk account',
        icon: zendeskIcon,
        call: getConnectCall(),
    };
    return binding;
}

function commandDisconnect(): AppBinding {
    const binding: AppBinding = {
        location: commandLocations.locationDisconnect,
        label: 'disconnect',
        description: 'Disconnect your Zendesk account',
        icon: zendeskIcon,
        call: getDisconnectCall(),
    };
    return binding;
}

function getConnectCall(): AppCall {
    const url: string = getManifest().root_url + routes.BindingPathConnect;
    const call: AppCall = {
        url,
    };
    return call;
}

function getDisconnectCall(): AppCall {
    const url: string = getManifest().root_url + routes.BindingPathDisconnect;
    const call: AppCall = {
        url,
    };
    return call;
}
