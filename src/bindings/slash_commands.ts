import {AppBinding} from 'types/apps';

import {newCommandBindings} from '../utils';
import {isZdAdmin} from '../utils/utils';
import {BindingOptions} from 'bindings';

import {getConfigureBinding, getConnectBinding, getDisconnectBinding, getHelpBinding, getSubscribeBinding, getWebhookBinding} from './bindings';

// getCommandBindings returns the users slash command bindings
export const getCommandBindings = (options: BindingOptions): AppBinding => {
    const bindings: AppBinding[] = [];

    // Only show configuration option if admin has not configured the plugin
    if (!options.isConfigured) {
        if (options.isSystemAdmin) {
            bindings.push(getConfigureBinding());
            bindings.push(getHelpBinding());
            return newCommandBindings(bindings);
        }
    }
    if (options.isConnected) {
        // Only admins can create triggers and webhooks in zendesk
        if (isZdAdmin(options.zdUserRole)) {
            bindings.push(getSubscribeBinding());
            if (options.isSystemAdmin) {
                bindings.push(getWebhookBinding());
            }
        }
        bindings.push(getDisconnectBinding());
    } else {
        bindings.push(getConnectBinding());
    }

    if (options.isSystemAdmin) {
        bindings.push(getConfigureBinding());
    }
    bindings.push(getHelpBinding());
    return newCommandBindings(bindings);
};
