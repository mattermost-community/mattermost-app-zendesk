import {AppBinding} from 'mattermost-redux/types/apps';

import {newCommandBindings} from '../utils';
import {isZdAdmin} from '../utils/utils';
import {BindingOptions} from 'bindings';

import {getConnectBinding, getDisconnectBinding, getConfigureBinding, getSubscribeBinding, getHelpBinding, getTargetBinding} from './bindings';

// getCommandBindings returns the users slash command bindings
export const getCommandBindings = (options: BindingOptions): AppBinding => {
    const bindings: AppBinding[] = [];
    const mmSiteURL = options.mattermostSiteUrl;

    // only show configuration option if admin has not configured the plugin
    if (!options.isConfigured) {
        if (options.isSystemAdmin) {
            bindings.push(getConfigureBinding(mmSiteURL));
            bindings.push(getHelpBinding(mmSiteURL));
            return newCommandBindings(mmSiteURL, bindings);
        }
    }
    if (options.isConnected) {
        // only admins can create triggers and targets in zendesk
        if (isZdAdmin(options.zdUserRole)) {
            bindings.push(getSubscribeBinding(mmSiteURL));
            if (options.isSystemAdmin) {
                bindings.push(getTargetBinding(mmSiteURL));
            }
        }
        bindings.push(getDisconnectBinding(mmSiteURL));

        // bindings.push(getMeBinding(mmSiteURL));
    } else {
        bindings.push(getConnectBinding(mmSiteURL));
    }

    if (options.isSystemAdmin) {
        bindings.push(getConfigureBinding(mmSiteURL));
    }
    bindings.push(getHelpBinding(mmSiteURL));
    return newCommandBindings(mmSiteURL, bindings);
};

