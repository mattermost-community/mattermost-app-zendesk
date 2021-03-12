import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {AppBinding} from 'mattermost-redux/types/apps';

import {isUserConnected, isUserSysadmin} from '../app/user';

// Bindings base class stores user info for subclasses
export class Bindings {
    userID: string
    private isUserSysadmin: Promise<boolean>
    private isUserConnected: boolean
    private bindings: AppBinding[]

    constructor(userID: string) {
        this.userID = userID;
        this.isUserConnected = isUserConnected(userID);
        this.isUserSysadmin = isUserSysadmin(userID);

        this.bindings = [];
    }

    addBindings = (binding: AppBinding): void => {
        this.bindings.push(binding);
    }

    getAllBindings = (): AppBinding[] => {
        return this.bindings;
    }

    isConnected = (): boolean => {
        return this.isUserConnected;
    }

    isSysadmin = (): Promise<boolean> => {
        return this.isUserSysadmin;
    }
}

export function newPostMenuBindings(bindings: AppBinding[]): AppBinding {
    const binding = {
        location: AppBindingLocations.POST_MENU_ITEM,
        bindings,
    };
    return binding || {};
}

export function newCommandBindings(bindings: AppBinding[]): AppBinding {
    const binding = {
        location: AppBindingLocations.COMMAND,
        bindings,
    };
    return binding || {};
}

export function newChannelHeaderBindings(bindings: AppBinding[]): AppBinding {
    const binding = {
        location: AppBindingLocations.CHANNEL_HEADER_ICON,
        bindings,
    };
    return binding || {};
}
