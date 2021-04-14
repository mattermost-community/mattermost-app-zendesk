import {AppBinding, AppContext} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {getStaticURL, Routes, newChannelHeaderBindings} from '../utils';
import {CommandLocations, ZendeskIcon} from '../utils/constants';

// getChannelHeaderBindings returns the users command bindings
export const getChannelHeaderBindings = (context: AppContext, configured: boolean, connected: boolean, sysadmin: boolean): AppBinding => {
    const bindings: AppBinding[] = [];

    // only show configuration option if admin has not configured the plugin
    if (!configured && sysadmin) {
        bindings.push(channelHeaderConfig(context));
        return newChannelHeaderBindings(bindings);
    }

    if (connected) {
        bindings.push(channelHeaderSubscribe(context));
    }
    return newChannelHeaderBindings(bindings);
};

const channelHeaderSubscribe = (context: AppContext): AppBinding => {
    return {
        location: CommandLocations.Subscribe,
        label: 'Create Zendesk Subscription',
        description: 'Open Create Zendesk Subscription Modal',
        icon: getStaticURL(context, ZendeskIcon),
        call: {
            path: Routes.App.CallPathSubsOpenForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

const channelHeaderConfig = (context: AppContext): AppBinding => {
    return {
        location: CommandLocations.Configure,
        label: 'Configure Zendesk',
        description: 'Open Create Zendesk Config Modal',
        icon: getStaticURL(context, ZendeskIcon),
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
