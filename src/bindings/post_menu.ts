import {AppBinding, AppCall} from 'mattermost-redux/types/apps';
import {AppsBindings, AppCallTypes, AppExpandLevels} from 'mattermost-redux/constants/apps';

import {isUserConnected} from '../app/user';

import {zendeskIcon, routes} from '../utils';
import {getManifest} from '../../manifest';

// postMenuBindings returns bindings for the post_menu location
export function postMenuBindings(userID: string): AppBinding {
    if (!isUserConnected(userID)) {
        return {};
    }

    const binding = {
        location: AppsBindings.POST_MENU_ITEM,
        bindings: [
            postMenuCreate(),
        ],
    };
    return binding || {};
}

function postMenuCreate(): AppBinding {
    return {
        label: 'Create Zendesk Ticket',
        description: 'Create ticket in Zendesk',
        icon: zendeskIcon,
        call: getPostMenuCreateCall(),
    } as AppBinding;
}

function getPostMenuCreateCall(): AppCall {
    const url: string = getManifest().root_url + routes.app.BindingPathCreateForm;
    return {
        url,
        type: AppCallTypes.FORM,
        expand: {
            post: AppExpandLevels.EXPAND_ALL,
        },
    } as AppCall;
}

