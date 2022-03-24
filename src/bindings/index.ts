import {AppBinding} from 'types/apps';

import {CtxExpandedActingUserOauth2AppOauth2User} from 'types/apps';
import {isConfigured, isConnected, isUserSystemAdmin} from '../utils';
import {ZDRole} from '../utils/ZDTypes';

import {getCommandBindings} from './slash_commands';
import {getPostMenuBindings} from './post_menu';
import {getChannelHeaderBindings} from './channel_header';

export type BindingOptions = {
    isSystemAdmin: boolean,
    isConfigured: boolean,
    isConnected: boolean
    zdUserRole: ZDRole,
    mattermostSiteUrl: string
}
export function getBindings(context: CtxExpandedActingUserOauth2AppOauth2User): AppBinding[] {
    const bindingOptions = {
        isSystemAdmin: isUserSystemAdmin(context.acting_user),
        isConfigured: isConfigured(context.oauth2),
        isConnected: isConnected(context.oauth2.user),
        zdUserRole: context.oauth2.user?.role,
        mattermostSiteUrl: context.mattermost_site_url,
    };

    const bindings: AppBinding[] = [];

    const postMenu = getPostMenuBindings(bindingOptions);
    if (postMenu.bindings?.length) {
        bindings.push(postMenu);
    }

    const command = getCommandBindings(bindingOptions);
    if (command.bindings?.length) {
        bindings.push(command);
    }

    const channelHeader = getChannelHeaderBindings(bindingOptions);
    if (channelHeader.bindings?.length) {
        bindings.push(channelHeader);
    }

    return bindings;
}
