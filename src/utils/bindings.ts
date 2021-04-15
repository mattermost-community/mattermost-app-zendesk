import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {AppBinding, AppContext} from 'mattermost-redux/types/apps';

import {CommandTrigger, ZendeskIcon} from '../utils/constants';
import {getStaticURL} from '../utils';

// Bindings base class stores user info for subclasses
export class Bindings {
    sysadmin: boolean
    private bindings: AppBinding[]

    constructor(isSysadmin: boolean) {
        this.sysadmin = isSysadmin;
        this.bindings = [];
    }

    addBindings = (binding: AppBinding): void => {
        this.bindings.push(binding);
    }

    getAllBindings = (): AppBinding[] => {
        return this.bindings;
    }

    // check if user is sysadmin through mattermost API
    isSysadmin = (): boolean => {
        return this.sysadmin;
    }
}

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
