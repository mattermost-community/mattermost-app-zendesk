import {AppBinding, AppContext} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {Routes, CommandLocations, ZendeskIcon} from 'utils/constants';
import {getStaticURL, newPostMenuBindings} from 'utils';
import {getManifest} from 'manifest';

// getPostMenuBindings returns the users post menu bindings
export const getPostMenuBindings = (context: AppContext, configured: boolean, connected: boolean, sysadmin: boolean): AppBinding => {
    const bindings: AppBinding[] = [];

    // only show configuration option if admin has not configured the plugin
    if (!configured && sysadmin) {
        return newPostMenuBindings(bindings);
    }

    if (connected) {
        bindings.push(openCreateTicketForm(context));
        bindings.push(openSubscriptionsForm(context));
    }
    return newPostMenuBindings(bindings);
};

const openCreateTicketForm = (context: AppContext): AppBinding => {
    return {
        app_id: getManifest().app_id,
        label: 'Create Zendesk Ticket',
        description: 'Create ticket in Zendesk',
        icon: getStaticURL(context, ZendeskIcon),
        location: CommandLocations.Ticket,
        call: {
            path: Routes.App.CallPathTicketOpenForm,
            expand: {
                post: AppExpandLevels.EXPAND_ALL,
                acting_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    };
};

const openSubscriptionsForm = (context: AppContext): AppBinding => {
    return {
        label: 'Zendesk Subscriptions',
        description: 'Subscribe channel to Zendesk notifications',
        icon: getStaticURL(context, ZendeskIcon),
        location: CommandLocations.Subscribe,
        call: {
            path: Routes.App.CallPathSubsOpenForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

