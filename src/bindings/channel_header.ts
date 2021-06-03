import {AppBinding} from 'mattermost-redux/types/apps';

import {newChannelHeaderBindings, isZdAdmin} from '../utils';

import {getSubscribeBinding} from './bindings';

import {BindingOptions} from './index';

// getChannelHeaderBindings returns the users command bindings
export const getChannelHeaderBindings = (options: BindingOptions): AppBinding => {
    const bindings: AppBinding[] = [];
    if (options.isConnected && isZdAdmin(options.zdUserRole)) {
        bindings.push(getSubscribeBinding('Create Subscription'));
    }
    return newChannelHeaderBindings(bindings);
};
