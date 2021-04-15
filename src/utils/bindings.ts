import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {AppBinding, AppContext} from 'mattermost-redux/types/apps';

import {CommandTrigger, ZendeskIcon} from '../utils/constants';
import {getStaticURL} from '../utils';

export function newPostMenuBindings(bindings: AppBinding[]): AppBinding {
    const binding = {
        location: AppBindingLocations.POST_MENU_ITEM,
        bindings,
    };
    return binding;
}

export function newCommandBindings(context: AppContext, bindings: AppBinding[]): AppBinding {
    const binding = {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: getStaticURL(context, ZendeskIcon),
                label: CommandTrigger,
                description: 'Manage Zendesk tickets',
                hint: '',
                bindings,
            },
        ],
    };
    return binding;
}

export function newChannelHeaderBindings(bindings: AppBinding[]): AppBinding {
    const binding = {
        location: AppBindingLocations.CHANNEL_HEADER_ICON,
        bindings,
    };
    return binding;
}
