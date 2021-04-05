import {AppBinding} from 'mattermost-redux/types/apps';

import {AppContextWithBot} from 'types/apps';

import {Bindings} from '../utils';

import {isUserConnected, isUserSysadmin} from '../app/user';
import {newConfigStore} from '../store/config';

import {getCommandBindings} from './slash_commands';
import {getPostMenuBindings} from './post_menu';
import {getChannelHeaderBindings} from './channel_header';

export async function getBindings(context: AppContextWithBot): Promise<AppBinding[]> {
    // prefetch these requests only one time
    const configStore = newConfigStore(context);
    const [isConfigured, isConnected, isSysadmin] = await Promise.all([
        configStore.isConfigured(),
        isUserConnected(context),
        isUserSysadmin(context),
    ]);

    const b = new Bindings(isConfigured, isConnected, isSysadmin);
    b.addBindings(getPostMenuBindings(isConfigured, isConnected, isSysadmin));
    b.addBindings(getCommandBindings(isConfigured, isConnected, isSysadmin));
    b.addBindings(getChannelHeaderBindings(isConfigured, isConnected, isSysadmin));
    return b.getAllBindings();
}

