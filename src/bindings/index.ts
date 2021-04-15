import {AppBinding, AppContext} from 'mattermost-redux/types/apps';

import {isUserSysadmin} from '../app/user';

import {getCommandBindings} from './slash_commands';
import {getPostMenuBindings} from './post_menu';
import {getChannelHeaderBindings} from './channel_header';

export async function getBindings(context: AppContext): Promise<AppBinding[]> {
    // prefetch these requests only one time
    const isSysadmin = await isUserSysadmin(context);

    const bindings: AppBinding[] = [];
    bindings.push(getPostMenuBindings(context, isSysadmin));
    bindings.push(getCommandBindings(context, isSysadmin));
    bindings.push(getChannelHeaderBindings(context, isSysadmin));
    return bindings;
}
