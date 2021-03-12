import {AppBinding} from 'mattermost-redux/types/apps';

import {Bindings} from '../utils';

import {getCommandBindings} from './slash_commands';
import {getPostMenuBindings} from './post_menu';
import {getChannelHeaderBindings} from './channel_header';

export function getBindings(userID: string): AppBinding[] {
    const b = new Bindings(userID);
    b.addBindings(getPostMenuBindings(userID));
    b.addBindings(getCommandBindings(userID));
    b.addBindings(getChannelHeaderBindings(userID));
    return b.getAllBindings();
}
