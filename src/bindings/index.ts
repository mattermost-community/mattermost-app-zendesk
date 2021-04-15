import {AppBinding, AppContext} from 'mattermost-redux/types/apps';

import {Bindings} from '../utils';

import {isUserSysadmin} from '../app/user';

import {getCommandBindings} from './slash_commands';
import {getPostMenuBindings} from './post_menu';
import {getChannelHeaderBindings} from './channel_header';

export async function getBindings(context: AppContext): Promise<AppBinding[]> {
    const oauth2 = context.oauth2;
    const isConfigured = Boolean(oauth2.client_id && oauth2.client_secret);
    const isConnected = oauth2.user.access_token !== '';

    // prefetch these requests only one time
    const isSysadmin = await isUserSysadmin(context);

    const b = new Bindings(isConfigured, isConnected, isSysadmin);
    b.addBindings(getPostMenuBindings(context, isConfigured, isConnected, isSysadmin));
    b.addBindings(getCommandBindings(context, isConfigured, isConnected, isSysadmin));
    b.addBindings(getChannelHeaderBindings(context, isConfigured, isConnected, isSysadmin));
    return b.getAllBindings();
}
