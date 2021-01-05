import {AppBinding} from 'mattermost-redux/types/apps';

import {ZDIcon, Routes, CommandLocations} from '../utils/constants';
import {newCommandBindings, Bindings} from '../utils';

// getCommandBindings returns the users slash command bindings
export const getCommandBindings = (userID: string): AppBinding[] => {
    return new CommandBindings(userID).getBindings();
};

// CommandBindings class for creating slash command location bindings
class CommandBindings extends Bindings {
    getBindings = (): AppBinding[] => {
        const bindings: AppBinding[] = [];
        if (this.isConnected()) {
            bindings.push(this.cmdDisconnect());
            if (this.isSysadmin()) {
                bindings.push(this.cmdSubscribe());
            }
        } else {
            bindings.push(this.cmdConnect());
        }
        bindings.push(this.cmdHelp());

        return newCommandBindings(bindings);
    }

    cmdConnect = (): AppBinding => {
        return {
            location: CommandLocations.Connect,
            label: 'connect',
            description: 'Connect your Zendesk account',
            icon: ZDIcon,
            call: {
                url: Routes.App.BindingPathConnect,
            },
        } as AppBinding;
    }

    cmdDisconnect = (): AppBinding => {
        return {
            location: CommandLocations.Disconnect,
            label: 'disconnect',
            description: 'Disconnect your Zendesk account',
            icon: ZDIcon,
            call: {
                url: Routes.App.BindingPathDisconnect,
            },
        } as AppBinding;
    }

    cmdSubscribe = (): AppBinding => {
        return {
            location: CommandLocations.Subscribe,
            label: 'subscribe',
            description: 'Subscribe notifications to a channel',
            icon: ZDIcon,
            call: {
                url: Routes.App.BindingPathOpenSubcriptionsForm,
            },
        } as AppBinding;
    }

    cmdHelp = (): AppBinding => {
        return {
            location: CommandLocations.Help,
            label: 'help',
            description: 'Show Zendesk Help',
            icon: ZDIcon,
            call: {
                url: Routes.App.BindingPathHelp,
            },
        } as AppBinding;
    }
}

