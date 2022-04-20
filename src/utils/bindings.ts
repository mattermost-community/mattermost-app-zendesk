import {AppBinding} from 'types/apps';

import {AppBindingLocations} from 'constants/apps';
import {CommandTrigger, ZendeskIcon} from 'constants/zendesk';

import {getManifest} from '../manifest';

export const newPostMenuBindings = (bindings: AppBinding[]): AppBinding => {
    return {
        app_id: getManifest().app_id,
        label: CommandTrigger,
        location: AppBindingLocations.POST_MENU_ITEM,
        bindings,
    };
};

export const newCommandBindings = (bindings: AppBinding[]): AppBinding => {
    return {
        app_id: getManifest().app_id,
        label: CommandTrigger,
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                app_id: getManifest().app_id,
                icon: ZendeskIcon,
                label: CommandTrigger,
                description: 'Manage Zendesk tickets',
                hint: '',
                bindings,
            },
        ],
    };
};

export const newChannelHeaderBindings = (bindings: AppBinding[]): AppBinding => {
    return {
        app_id: getManifest().app_id,
        label: CommandTrigger,
        location: AppBindingLocations.CHANNEL_HEADER_ICON,
        bindings,
    };
};
