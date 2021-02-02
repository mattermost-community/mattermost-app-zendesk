import {AppBinding} from 'mattermost-redux/types/apps';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';

import {isUserConnected} from '../app/user';

import {ZDIcon, Routes, CommandLocations} from '../utils';

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
        location: CommandLocations.Connect,
        label: 'connect',
        description: 'Connect your Zendesk account',
        icon: ZDIcon,
        call: {
            url: Routes.App.BindingPathConnect,
        },
    } as AppBinding;
}

function commandDisconnect(): AppBinding {
    return {
        location: CommandLocations.Disconnect,
        label: 'disconnect',
        description: 'Disconnect your Zendesk account',
        icon: ZDIcon,
        call: {
            url: Routes.App.BindingPathDisconnect,
        },
    } as AppBinding;
}
