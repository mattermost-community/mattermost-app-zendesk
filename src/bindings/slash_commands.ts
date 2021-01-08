import {AppBinding, AppCall} from 'mattermost-redux/types/apps';
import {AppBindingLocations, AppCallTypes} from 'mattermost-redux/constants/apps';

import {isUserConnected} from '../app/user';

import {zdIcon, routes, commandLocations} from '../utils';

// commandBindings returns bindings for the slash command location
export function commandBindings(userID: string): AppBinding {
    const bindings: Array<AppBinding> = [];
    if (isUserConnected(userID)) {
        bindings.push(commandDisconnect());
    } else {
        bindings.push(commandConnect());
    }

    return {
        location: AppBindingLocations.COMMAND,
        bindings,
    } as AppBinding;
}

function commandConnect(): AppBinding {
    return {
        location: commandLocations.Connect,
        label: 'connect',
        description: 'Connect your Zendesk account',
        icon: zdIcon,
        call: getConnectCall(),
    } as AppBinding;
}

function getConnectCall(): AppCall {
    return {
        type: AppCallTypes.FORM,
        url: routes.app.BindingPathConnect,
    } as AppCall;
}

function commandDisconnect(): AppBinding {
    return {
        location: commandLocations.Disconnect,
        label: 'disconnect',
        description: 'Disconnect your Zendesk account',
        icon: zdIcon,
        call: getDisconnectCall(),
    } as AppBinding;
}

function getDisconnectCall(): AppCall {
    return {
        url: routes.app.BindingPathDisconnect,
    } as AppCall;
}
