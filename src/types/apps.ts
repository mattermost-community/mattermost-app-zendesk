/* eslint-disable camelcase */
import {UserProfile} from 'mattermost-redux/types/users';
import {Post} from 'mattermost-redux/types/posts';
import {Channel} from 'mattermost-redux/types/channels';
import {AppContext, AppCall, AppCallValues} from 'mattermost-redux/types/apps';

export type ZDOauth2User = {
    access_token: string
    scope?: string[]
    token_type?: string
}

export type App = {
    webhook_secret: string;
}

export type Oauth2App = {
    client_id: string;
    client_secret: string;
    connect_url?: string;
    complete_url?: string;
    user?: ZDOauth2User
}

export type ExpandedBot = AppContext & {
    bot_user_id: string,
    bot_access_token: string,
}

export type ExpandedActingUserAccessToken = AppContext & {
    acting_user_access_token: string
}

export type CtxExpandedBotAdminActingUser = AppContext & {
    acting_user: UserProfile,
    acting_user_id: string,
    acting_user_access_token: string
    admin_access_token: string
    bot_user_id: string,
    bot_access_token: string,
}

export type ExpandedAdmin = AppContext & {
    admin_access_token: string
}

export type ExpandedPost = AppContext & {
    post: Post
}

export type ExpandedChannel = AppContext & {
    channel: Channel
    channel_id: string
}

export type ExpandedOauth2User = {
    oauth2: {
        user: ZDOauth2User
    }
}

export type ExpandedApp = AppContext & {
    app: App
}

export type ExpandedOauth2App = AppContext & {
    oauth2: Oauth2App,
}

export type AppCallRequestWithValues = AppCall & {
    values: AppCallValues
    context: AppContext
}

export type CtxExpandedActingUser = AppContext & {
    acting_user: UserProfile,
    acting_user_id: string,
    acting_user_access_token: string
}

// export type CtxExpandedOauth2User = AppContext & CtxExpandedOauth2User
export type CtxExpandedBotAdminActingUserOauth2User = CtxExpandedActingUser & ExpandedOauth2User & ExpandedBot & ExpandedAdmin
export type CtxExpandedBotAdminActingUserOauth2UserChannel = CtxExpandedActingUser & ExpandedOauth2User & ExpandedBot & ExpandedAdmin & ExpandedChannel
export type CtxExpandedActingUserOauth2App = CtxExpandedActingUser & ExpandedOauth2App
export type CtxExpandedActingUserOauth2AppOauth2User = CtxExpandedActingUser & ExpandedOauth2App & ExpandedOauth2User
export type CtxExpandedActingUserOauth2AppBot = CtxExpandedActingUser & ExpandedOauth2App & ExpandedBot
export type CtxExpandedBotActingUserAccessToken = ExpandedActingUserAccessToken & ExpandedBot
export type CtxExpandedBotApp = ExpandedBot & ExpandedApp
