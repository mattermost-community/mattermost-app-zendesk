import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {AppBinding} from 'mattermost-redux/types/apps';

import {ZDIcon} from '../utils';

// Bindings base class stores user info for subclasses
export class Bindings {
    configured: boolean
    connected: boolean
    sysadmin: boolean
    private bindings: AppBinding[]

    constructor(isConfigured: boolean, isConnected: boolean, isSysadmin: boolean) {
        this.configured = isConfigured;
        this.connected = isConnected;
        this.sysadmin = isSysadmin;
        this.bindings = [];
    }

    addBindings = (binding: AppBinding): void => {
        this.bindings.push(binding);
    }

    getAllBindings = (): AppBinding[] => {
        return this.bindings;
    }

    // check if user connected with KV store
    isConnected = (): boolean => {
        return this.connected;
    }

    // check if user is sysadmin through mattermost API
    isSysadmin = (): boolean => {
        return this.sysadmin;
    }

    // check if zendesk configuration has been complete
    isConfigured = (): boolean => {
        return this.configured;
    }
}

export function newPostMenuBindings(bindings: AppBinding[]): AppBinding {
    const binding = {
        location: AppBindingLocations.POST_MENU_ITEM,
        bindings,
    };
    return binding;
}

export function newCommandBindings(bindings: AppBinding[]): AppBinding {
    const binding = {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: ZDIcon,
                label: 'zendesk',
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
