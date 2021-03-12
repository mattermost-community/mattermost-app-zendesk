import {AppBinding} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {AppID, ZDIcon, Routes} from '../utils/constants';
import {newPostMenuBindings} from '../utils';

// getPostMenuBindings returns the users post menu bindings
export const getPostMenuBindings = (configured: boolean, connected: boolean, sysadmin: boolean): AppBinding => {
    const bindings: AppBinding[] = [];

    // only show configuration option if admin has not configured the plugin
    if (!configured && sysadmin) {
        return newPostMenuBindings(bindings);
    }

    if (connected) {
        bindings.push(openCreateTicketForm());
        bindings.push(openSubscriptionsForm());
    }
    return newPostMenuBindings(bindings);
};

const openCreateTicketForm = (): AppBinding => {
    return {
        app_id: AppID,
        label: 'Create Zendesk Ticket',
        description: 'Create ticket in Zendesk',
        icon: ZDIcon,
        location: 'open_ticket',
        call: {
            path: Routes.App.BindingPathOpenCreateTicketForm,
            expand: {
                post: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

const openSubscriptionsForm = (): AppBinding => {
    return {
        app_id: AppID,
        label: 'Zendesk Subscriptions',
        description: 'Subscribe channel to Zendesk notifications',
        icon: ZDIcon,
        location: 'open_subscription',
        call: {
            path: Routes.App.BindingPathOpenSubscriptionsForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

