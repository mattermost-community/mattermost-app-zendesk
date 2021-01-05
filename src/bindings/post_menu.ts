import {AppBinding} from 'mattermost-redux/types/apps';

import {AppID, ZDIcon, Routes} from '../utils/constants';
import {Bindings, newPostMenuBindings} from '../utils';

// getPostMenuBindings returns the users post menu bindings
export const getPostMenuBindings = (userID: string): AppBinding => {
    return new PostMenuBindings(userID).getBindings();
};

// PostMenuBindings class for creating post_menu location bindings
class PostMenuBindings extends Bindings {
    getBindings = (): AppBinding[] => {
        const bindings: AppBinding[] = [];
        if (this.isConnected()) {
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
                    post: 'all',
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
                expand: {
                    post: 'all',
                },
            },
        } as AppBinding;
    }
}

