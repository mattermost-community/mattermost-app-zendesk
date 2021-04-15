import {AppBinding, AppContext} from 'mattermost-redux/types/apps';

import {Bindings} from '../utils';

import {isUserSysadmin} from '../app/user';

import {getCommandBindings} from './slash_commands';
import {getPostMenuBindings} from './post_menu';
import {getChannelHeaderBindings} from './channel_header';

export async function getBindings(context: AppContext): Promise<AppBinding[]> {
    // prefetch these requests only one time
    const isSysadmin = await isUserSysadmin(context);

    const b = new Bindings(isSysadmin);
    b.addBindings(getPostMenuBindings(context, isSysadmin));
    b.addBindings(getCommandBindings(context, isSysadmin));
    b.addBindings(getChannelHeaderBindings(context, isSysadmin));
    return b.getAllBindings();
}
