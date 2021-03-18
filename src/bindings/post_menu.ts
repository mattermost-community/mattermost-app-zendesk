import {AppBinding} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {ZDIcon, Routes, CommandLocations} from '../utils/constants';
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
        label: 'Create Zendesk Ticket',
        description: 'Create ticket in Zendesk',
        icon: ZDIcon,
        location: CommandLocations.Ticket,
        call: {
            path: Routes.App.CallPathTicketOpenForm,
            expand: {
                post: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

const openSubscriptionsForm = (): AppBinding => {
    return {
        label: 'Zendesk Subscriptions',
        description: 'Subscribe channel to Zendesk notifications',
        icon: ZDIcon,
        location: CommandLocations.Subscribe,
        call: {
            path: Routes.App.CallPathSubsOpenForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
            },
        },
    } as AppBinding;
};

