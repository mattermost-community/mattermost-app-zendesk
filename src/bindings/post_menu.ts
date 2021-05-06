import {AppBinding} from 'mattermost-redux/types/apps';

import {isZdAdmin, isZdAgent} from '../utils/utils';
import {newPostMenuBindings} from '../utils';

import {getCreateTicketBinding} from './bindings';

import {BindingOptions} from './index';

// getPostMenuBindings returns the users post menu bindings
export const getPostMenuBindings = (options: BindingOptions): AppBinding => {
    const bindings: AppBinding[] = [];

    // do not show any post menu options if the app is not configured
    if (!options.isConfigured) {
        return newPostMenuBindings(bindings);
    }

    // admins and agents can create tickets in Zendesk
    if (options.isConnected) {
        if (isZdAdmin(options.zdUserRole) || isZdAgent(options.zdUserRole)) {
            bindings.push(getCreateTicketBinding(options.mattermostSiteUrl));
        }
    }
    return newPostMenuBindings(bindings);
};

