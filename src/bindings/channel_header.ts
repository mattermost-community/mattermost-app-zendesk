import {AppBinding} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {getStaticURL, Routes, newChannelHeaderBindings} from '../utils';
import {Locations, ZendeskIcon} from '../utils/constants';

import {BindingOptions} from './index';

// getChannelHeaderBindings returns the users command bindings
export const getChannelHeaderBindings = (options: BindingOptions): AppBinding => {
    const bindings: AppBinding[] = [];
    if (options.isSystemAdmin) {
        // only show configuration option if admin has not configured the plugin
        if (!options.isConfigured) {
            bindings.push(channelHeaderConfig(options.mattermostSiteUrl));
        } else if (options.isConnected) {
            bindings.push(channelHeaderSubscribe(options.mattermostSiteUrl));
        }
    }
    return newChannelHeaderBindings(bindings);
};

const channelHeaderSubscribe = (mmSiteURL): AppBinding => {
    return {
        location: Locations.Subscribe,
        label: 'Create Zendesk Subscription',
        description: 'Open Create Zendesk Subscription Modal',
        icon: getStaticURL(mmSiteURL, ZendeskIcon),
        call: {
            path: Routes.App.CallPathSubsOpenForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
                channel: AppExpandLevels.EXPAND_SUMMARY,
                admin_access_token: AppExpandLevels.EXPAND_ALL,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

const channelHeaderConfig = (mmSiteURL: string): AppBinding => {
    return {
        location: Locations.Configure,
        label: 'Configure Zendesk',
        description: 'Open Create Zendesk Config Modal',
        icon: getStaticURL(mmSiteURL, ZendeskIcon),
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
