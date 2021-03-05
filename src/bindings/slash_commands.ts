import {AppBinding} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {ZDIcon, Routes, CommandLocations} from '../utils/constants';
import {newCommandBindings} from '../utils';

// getCommandBindings returns the users slash command bindings
export const getCommandBindings = (configured: boolean, connected: boolean, sysadmin: boolean): AppBinding => {
    const bindings: AppBinding[] = [];

    // only show configuration option if admin has not configured the plugin
    if (!configured && sysadmin) {
        bindings.push(cmdConfigure());
        bindings.push(cmdHelp());
        return newCommandBindings(bindings);
    }

    if (connected) {
        bindings.push(cmdDisconnect());
        if (sysadmin) {
            bindings.push(cmdSubscribe());
        }
    } else {
        bindings.push(cmdConnect());
    }
    bindings.push(cmdConfigure());
    bindings.push(cmdHelp());
    return newCommandBindings(bindings);
};

// CommandBindings class for creating slash command location bindings
const cmdConnect = (): AppBinding => {
    return {
        location: CommandLocations.Connect,
        label: 'connect',
        description: 'Connect your Zendesk account',
        icon: ZDIcon,
        call: {
            path: Routes.App.BindingPathConnect,
        },
    } as AppBinding;
};

const cmdDisconnect = (): AppBinding => {
    return {
        location: CommandLocations.Disconnect,
        label: 'disconnect',
        description: 'Disconnect your Zendesk account',
        icon: ZDIcon,
        call: {
            path: Routes.App.BindingPathDisconnect,
        },
    } as AppBinding;
};

const cmdSubscribe = (): AppBinding => {
    return {
        location: CommandLocations.Subscribe,
        label: 'subscribe',
        description: 'Subscribe notifications to a channel',
        icon: ZDIcon,
        call: {
            path: Routes.App.BindingPathOpenSubcriptionsForm,
        },
    } as AppBinding;
};

const cmdConfigure = (): AppBinding => {
    return {
        location: CommandLocations.Configure,
        label: 'configure',
        description: 'Configure the installed Zendesk account',
        icon: ZDIcon,
        call: {
            path: Routes.App.BindingPathOpenZendeskConfigForm,
        },
    } as AppBinding;
};

const cmdHelp = (): AppBinding => {
    return {
        location: CommandLocations.Help,
        label: 'help',
        description: 'Show Zendesk Help',
        icon: ZDIcon,
        call: {
            path: Routes.App.BindingPathHelp,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

