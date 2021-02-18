import {AppBinding} from 'mattermost-redux/types/apps';

import {ZDIcon, Routes, newChannelHeaderBindings, Bindings} from '../utils';

// getChannelHeaderBindings returns the users command bindings
export const getChannelHeaderBindings = (isConfigured: boolean, isConnected: boolean, isSysadmin: boolean): AppBinding => {
    const b = new ChannelHeaderBindings(isConfigured, isConnected, isSysadmin);
    const bindings = b.getBindings();
    return bindings;
};

// channelHeaderBindings returns bindings for the channel_header location
class ChannelHeaderBindings extends Bindings {
    getBindings = (): AppBinding => {
        const bindings: Array<AppBinding> = [];

        const connected = this.isConnected();
        const configured = this.isConfigured();
        const sysadmin = this.isSysadmin();

        // only show configuration option if admin has not configured the plugin
        if (!configured && sysadmin) {
            bindings.push(this.channelHeaderConfig());
            return newChannelHeaderBindings(bindings);
        }

        if (sysadmin) {
            bindings.push(this.channelHeaderConfig());
        }

        if (connected) {
            bindings.push(this.channelHeaderSubscribe());
        }

        return newChannelHeaderBindings(bindings);
    }

    channelHeaderSubscribe = (): AppBinding => {
        return {
            app_id: 'zendesk',
            label: 'Create Zendesk Subscription',
            description: 'Open Create Zendesk Subcription Modal',
            icon: ZDIcon,
            call: {
                url: Routes.App.BindingPathOpenSubcriptionsForm,
            },
        } as AppBinding;
    }

    channelHeaderConfig = (): AppBinding => {
        return {
            app_id: 'zendesk',
            label: 'Configure Zendesk',
            description: 'Open Create Zendesk Config Modal',
            icon: ZDIcon,
            call: {
                url: Routes.App.BindingPathOpenZendeskConfigForm,
            },
        } as AppBinding;
    }
}
