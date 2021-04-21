import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {AppBinding} from 'mattermost-redux/types/apps';

import {CommandTrigger, ZendeskIcon} from '../utils/constants';
import {getStaticURL} from '../utils';
import {getManifest} from '../manifest';

export function newPostMenuBindings(bindings: AppBinding[]): AppBinding {
    const binding: AppBinding = {
        app_id: getManifest().app_id,
        label: CommandTrigger,
        location: AppBindingLocations.POST_MENU_ITEM,
        bindings,
    };
    return binding;
}

export function newCommandBindings(mmSiteUrl: string, bindings: AppBinding[]): AppBinding {
    const binding: AppBinding = {
        app_id: getManifest().app_id,
        label: CommandTrigger,
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                app_id: getManifest().app_id,
                icon: getStaticURL(mmSiteUrl, ZendeskIcon),
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
    const binding: AppBinding = {
        app_id: getManifest().app_id,
        label: CommandTrigger,
        location: AppBindingLocations.CHANNEL_HEADER_ICON,
        bindings,
    };
    return binding;
}
