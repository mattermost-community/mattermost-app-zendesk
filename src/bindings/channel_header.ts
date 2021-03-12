import {AppBinding} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {ZDIcon, Routes, newChannelHeaderBindings} from '../utils';

// getChannelHeaderBindings returns the users command bindings
export const getChannelHeaderBindings = (configured: boolean, connected: boolean, sysadmin: boolean): AppBinding => {
    const bindings: AppBinding[] = [];

    // only show configuration option if admin has not configured the plugin
    if (!configured && sysadmin) {
        bindings.push(channelHeaderConfig());
        return newChannelHeaderBindings(bindings);
    }

    if (sysadmin) {
        bindings.push(channelHeaderConfig());
    }

    if (connected) {
        bindings.push(channelHeaderSubscribe());
    }
    return newChannelHeaderBindings(bindings);
};

const channelHeaderSubscribe = (): AppBinding => {
    return {
        app_id: 'zendesk',
        label: 'Create Zendesk Subscription',
        description: 'Open Create Zendesk Subcription Modal',
        icon: ZDIcon,
        call: {
            path: Routes.App.BindingPathOpenSubscriptionsForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

const channelHeaderConfig = (): AppBinding => {
    return {
        app_id: 'zendesk',
        label: 'Configure Zendesk',
        description: 'Open Create Zendesk Config Modal',
        icon: ZDIcon,
        call: {
            path: Routes.App.BindingPathOpenZendeskConfigForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};
