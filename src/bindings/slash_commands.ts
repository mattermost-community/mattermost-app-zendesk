import {AppBinding, AppContext} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {Routes, CommandLocations, ZendeskIcon} from '../utils/constants';
import {getStaticURL, newCommandBindings, isConfigured, isConnected} from '../utils';

// getCommandBindings returns the users slash command bindings
export const getCommandBindings = (context: AppContext, sysadmin: boolean): AppBinding => {
    const bindings: AppBinding[] = [];

    // only show configuration option if admin has not configured the plugin
    if (!isConfigured(context) && sysadmin) {
        bindings.push(cmdConfigure(context));
        bindings.push(cmdHelp(context));
        return newCommandBindings(context, bindings);
    }

    if (isConnected(context)) {
        bindings.push(cmdDisconnect(context));
        if (sysadmin) {
            bindings.push(cmdSubscribe(context));
        }
    } else {
        bindings.push(cmdConnect(context));
    }
    bindings.push(cmdConfigure(context));
    bindings.push(cmdHelp(context));
    return newCommandBindings(context, bindings);
};

// CommandBindings class for creating slash command location bindings
const cmdConnect = (context: AppContext): AppBinding => {
    return {
        location: CommandLocations.Connect,
        label: 'connect',
        description: 'Connect your Zendesk account',
        icon: getStaticURL(context, ZendeskIcon),
        form: {},
        call: {
            expand: {
                oauth2_app: AppExpandLevels.EXPAND_ALL,
            },
            path: Routes.App.BindingPathConnect,
        },
    } as AppBinding;
};

const cmdDisconnect = (context: AppContext): AppBinding => {
    return {
        location: CommandLocations.Disconnect,
        label: 'disconnect',
        description: 'Disconnect your Zendesk account',
        icon: getStaticURL(context, ZendeskIcon),
        form: {},
        call: {
            path: Routes.App.BindingPathDisconnect,
        },
    } as AppBinding;
};

const cmdSubscribe = (context: AppContext): AppBinding => {
    return {
        location: CommandLocations.Subscribe,
        label: 'subscribe',
        description: 'Subscribe notifications to a channel',
        icon: getStaticURL(context, ZendeskIcon),
        form: {},
        call: {
            path: Routes.App.CallPathSubsOpenForm,
            expand: {
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

const cmdConfigure = (context: AppContext): AppBinding => {
    return {
        location: CommandLocations.Configure,
        label: 'configure',
        description: 'Configure the installed Zendesk account',
        icon: getStaticURL(context, ZendeskIcon),
        form: {},
        call: {
            path: Routes.App.CallPathConfigOpenForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

const cmdHelp = (context: AppContext): AppBinding => {
    return {
        location: CommandLocations.Help,
        label: 'help',
        description: 'Show Zendesk Help',
        icon: getStaticURL(context, ZendeskIcon),
        form: {},
        call: {
            path: Routes.App.BindingPathHelp,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

