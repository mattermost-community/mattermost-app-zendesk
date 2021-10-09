import {AppBinding} from 'mattermost-redux/types/apps';

import {newCommandBindings} from '../utils';
import {isZdAdmin} from '../utils/utils';
import {BindingOptions} from 'bindings';

import {getConfigureBinding, getConnectBinding, getDisconnectBinding, getHelpBinding, getSubscribeBinding, getTargetBinding} from './bindings';

// getCommandBindings returns the users slash command bindings
export const getCommandBindings = (options: BindingOptions): AppBinding => {
    const bindings: AppBinding[] = [];

    // only show configuration option if admin has not configured the plugin
    if (!options.isConfigured) {
        if (options.isSystemAdmin) {
            bindings.push(getConfigureBinding());
            bindings.push(getHelpBinding());
            return newCommandBindings(bindings);
        }
    }
    if (options.isConnected) {
        // only admins can create triggers and targets in zendesk
        if (isZdAdmin(options.zdUserRole)) {
            bindings.push(getSubscribeBinding());
            if (options.isSystemAdmin) {
                bindings.push(getTargetBinding());
            }
        }
        bindings.push(getDisconnectBinding());

        // bindings.push(getMeBinding(mmSiteURL));
    } else {
        bindings.push(getConnectBinding());
    }

    if (options.isSystemAdmin) {
        bindings.push(getConfigureBinding());
    }
    bindings.push(getHelpBinding());
    return newCommandBindings(bindings);
};

