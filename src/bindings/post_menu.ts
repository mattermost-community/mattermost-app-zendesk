import {AppBinding} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {AppID, ZDIcon, Routes} from '../utils/constants';
import {Bindings, newPostMenuBindings} from '../utils';

// getPostMenuBindings returns the users post menu bindings
export const getPostMenuBindings = (isConfigured: boolean, isConnected: boolean, isSysadmin: boolean): AppBinding => {
    const b = new PostMenuBindings(isConfigured, isConnected, isSysadmin);
    const bindings = b.getBindings();
    return bindings;
};

// PostMenuBindings class for creating post_menu location bindings
class PostMenuBindings extends Bindings {
    getBindings = (): AppBinding[] => {
        const bindings: AppBinding[] = [];

        const connected = this.isConnected();
        const configured = this.isConfigured();
        const sysadmin = this.isSysadmin();

        // only show configuration option if admin has not configured the plugin
        if (!configured && sysadmin) {
            return newPostMenuBindings(bindings);
        }

        if (connected) {
            bindings.push(this.openCreateTicketForm());
            bindings.push(this.openSubscriptionsForm());
        }
        return newPostMenuBindings(bindings);
    }

    openCreateTicketForm = (): AppBinding => {
        return {
            app_id: AppID,
            label: 'Create Zendesk Ticket',
            description: 'Create ticket in Zendesk',
            icon: ZDIcon,
            location: 'open_ticket',
            call: {
                url: Routes.App.BindingPathOpenCreateTicketForm,
                expand: {
                    post: AppExpandLevels.EXPAND_ALL,
                },
            },
        } as AppBinding;
    }

    openSubscriptionsForm = (): AppBinding => {
        return {
            app_id: AppID,
            label: 'Zendesk Subscriptions',
            description: 'Create ticket in Zendesk',
            icon: ZDIcon,
            location: 'open_subscription',
            call: {
                url: Routes.App.BindingPathOpenSubcriptionsForm,
            },
        } as AppBinding;
    }
}

