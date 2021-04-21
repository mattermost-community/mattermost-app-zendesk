import {AppBinding} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {Routes, Locations, ZendeskIcon} from '../utils/constants';
import {getStaticURL, newPostMenuBindings} from '../utils';
import {getManifest} from '../manifest';

import {BindingOptions} from './index';

// getPostMenuBindings returns the users post menu bindings
export const getPostMenuBindings = (options: BindingOptions): AppBinding => {
    const bindings: AppBinding[] = [];

    // do not show any post menu options if the app is not configured
    if (!options.isConfigured) {
        return newPostMenuBindings(bindings);
    }
    if (options.isConnected) {
        bindings.push(openCreateTicketForm(options.mattermostSiteUrl));
        if (options.isSystemAdmin) {
            bindings.push(openSubscriptionsForm(options.mattermostSiteUrl));
        }
    }
    return newPostMenuBindings(bindings);
};

export const openCreateTicketForm = (mmSiteUrl: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        label: 'Create Zendesk Ticket',
        description: 'Create ticket in Zendesk',
        icon: getStaticURL(mmSiteUrl, ZendeskIcon),
        location: Locations.Ticket,
        call: {
            path: Routes.App.CallPathTicketOpenForm,
            expand: {
                post: AppExpandLevels.EXPAND_ALL,
                acting_user: AppExpandLevels.EXPAND_ALL,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    };
};

export const openSubscriptionsForm = (mmSiteUrl: string): AppBinding => {
    return {
        label: 'Zendesk Subscriptions',
        description: 'Subscribe channel to Zendesk notifications',
        icon: getStaticURL(mmSiteUrl, ZendeskIcon),
        location: Locations.Subscribe,
        call: {
            path: Routes.App.CallPathSubsOpenForm,
            expand: {
                admin_access_token: AppExpandLevels.EXPAND_ALL,
                acting_user: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

