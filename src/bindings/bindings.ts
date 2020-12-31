import {AppBinding, AppCall} from 'mattermost-redux/types/apps';
import {AppsBindings, AppCallTypes, AppExpandLevels} from 'mattermost-redux/constants/apps';

import {getManifest} from '../../manifest';
import {zendeskIcon, routes, commandLocations} from '../utils';

// getBindings returns bindings defined for all locations in the app
export const getBindings = (): AppBinding[] => {
    return [
        postMenuBindings(),
        commandBindings(),
    ] as AppBinding;
};

// postMenuBindings returns bindings for the post_menu location
function postMenuBindings(): AppBinding {
    return {
        location: AppsBindings.POST_MENU_ITEM,
        bindings: [
            postMenuCreate(),
        ],
    } as AppBinding;
}

function postMenuCreate(): AppBinding {
    return {
        label: 'Create Zendesk Ticket',
        description: 'Create ticket in Zendesk',
        icon: zendeskIcon,
        call: getPostMenuCreateCall(),
    } as AppBinding;
}

// commandBindings returns bindings for the slash command location
function commandBindings(): AppBinding {
    return {
        location: AppsBindings.COMMAND,
        bindings: [
            commandConnect(),
            commandDisconnect(),
        ],
    } as AppBinding;
}

function commandConnect(): AppBinding {
    return {
        location: commandLocations.Connect,
        label: 'connect',
        description: 'Connect your Zendesk account',
        icon: zendeskIcon,
        call: getConnectCall(),
    } as AppBinding;
}

function commandDisconnect(): AppBinding {
    return {
        location: commandLocations.Disconnect,
        label: 'disconnect',
        description: 'Disconnect your Zendesk account',
        icon: zendeskIcon,
        call: getDisconnectCall(),
    } as AppBinding;
}

function getPostMenuCreateCall(): AppCall {
    const url: string = getManifest().root_url + routes.app.BindingPathCreateForm;
    return {
        url,
        type: AppCallTypes.FORM,
        expand: {
            post: AppExpandLevels.EXPAND_ALL,
        },
    } as AppCall;
}

function getConnectCall(): AppCall {
    return {
        url: getManifest().root_url + routes.app.BindingPathConnect,
    } as AppCall;
}

function getDisconnectCall(): AppCall {
    return {
        url: getManifest().root_url + routes.app.BindingPathDisconnect,
    } as AppCall;
}
