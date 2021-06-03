import {AppBinding} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {Routes, newChannelHeaderBindings, isZdAdmin} from '../utils';
import {Locations, ZendeskIcon} from '../utils/constants';
import {getManifest} from '../manifest';

import {BindingOptions} from './index';

// getChannelHeaderBindings returns the users command bindings
export const getChannelHeaderBindings = (options: BindingOptions): AppBinding => {
    const bindings: AppBinding[] = [];
    if (options.isConnected && isZdAdmin(options.zdUserRole)) {
        bindings.push(channelHeaderSubscribe(options.mattermostSiteUrl));
    }
    return newChannelHeaderBindings(bindings);
};

const channelHeaderSubscribe = (mmSiteURL: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Subscribe,
        label: 'Create Zendesk Subscription',
        description: 'Open Create Zendesk Subscription Modal',
        icon: ZendeskIcon,
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
