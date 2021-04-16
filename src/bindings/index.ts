import {AppBinding, AppContext} from 'mattermost-redux/types/apps';

import {getCommandBindings} from './slash_commands';
import {getPostMenuBindings} from './post_menu';
import {getChannelHeaderBindings} from './channel_header';

export async function getBindings(context: AppContext): Promise<AppBinding[]> {
    const bindings: AppBinding[] = [];
    bindings.push(getPostMenuBindings(context));
    bindings.push(getCommandBindings(context));
    bindings.push(getChannelHeaderBindings(context));
    return bindings;
}
