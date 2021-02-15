import {AppBinding} from 'mattermost-redux/types/apps';

import {ZDIcon, Routes, newChannelHeaderBindings, Bindings} from '../utils';

// getChannelHeaderBindings returns the users command bindings
export const getChannelHeaderBindings = (userID: string): AppBinding => {
    return new ChannelHeaderBindings(userID).getBindings();
};

// channelHeaderBindings returns bindings for the channel_header location
class ChannelHeaderBindings extends Bindings {
    getBindings = (): AppBinding => {
        const bindings: Array<AppBinding> = [];
        if (this.isConnected() && this.isSysadmin()) {
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
                expand: {
                    post: 'all',
                },
            },
        } as AppBinding;
    }
}
