import {AppBinding, AppCall} from 'mattermost-redux/types/apps';
import {AppsBindings, AppCallTypes, AppExpandLevels} from 'mattermost-redux/constants/apps';

import {isUserConnected} from '../app/user';

import {getManifest} from '../../manifest';
import {zendeskIcon, routes, commandLocations} from '../utils';

type fbinding = () => AppBinding

function requireConnected(userID: string, f: fbinding): AppBinding {
    if (isUserConnected(userID)) {
        return f;
    }
    return {} as AppBinding;
}

// getBindings returns bindings defined for all locations in the app
export const getBindings = (userID: string): AppBinding[] => {
    return [
        requireConnected(userID, postMenuBindings()),
        commandBindings(userID),
    ] as AppBinding;
};

// postMenuBindings returns bindings for the post_menu location
function postMenuBindings(): AppBinding {
    let binding: AppBinding;

    binding = {
        location: AppsBindings.POST_MENU_ITEM,
        bindings: [
            postMenuCreate(),
        ],
    };
    return binding || {};
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
function commandBindings(userID: string): AppBinding {
    const bindings: Array<AppBinding> = [];
    if (isUserConnected(userID)) {
        bindings.push(commandDisconnect());
    } else {
        bindings.push(commandConnect());
    }

    return {
        location: AppsBindings.COMMAND,
        bindings,
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
