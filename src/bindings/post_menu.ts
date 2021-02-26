import {AppBinding, AppCall} from 'mattermost-redux/types/apps';
import {AppBindingLocations, AppCallTypes, AppExpandLevels} from 'mattermost-redux/constants/apps';

import {isUserConnected} from '../app/user';

import {ZDIcon, Routes} from '../utils';

// postMenuBindings returns bindings for the post_menu location
export function postMenuBindings(userID: string): AppBinding {
    if (!isUserConnected(userID)) {
        return {};
    }

    const binding = {
        location: AppBindingLocations.POST_MENU_ITEM,
        bindings: [
            postMenuCreate(),
        ],
    };
    return binding || {};
}

function postMenuCreate(): AppBinding {
    return {
        app_id: 'zendesk',
        label: 'Create Zendesk Ticket',
        description: 'Create ticket in Zendesk',
        icon: ZDIcon,
        call: {
            path: Routes.App.BindingPathOpenCreateTicketForm,
            expand: {
                post: 'all',
            },
        },
    } as AppBinding;
}
