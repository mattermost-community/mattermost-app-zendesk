import {UserProfile} from 'mattermost-redux/types/users';
import {Post} from 'mattermost-redux/types/posts';
import {Channel} from 'mattermost-redux/types/channels';
import {AppContext, AppCall, AppCallValues} from 'mattermost-redux/types/apps';

export type ZDOauth2User = {
    access_token: string
    scope?: string[]
    token_type?: string
}

export type Oauth2App = {
    client_id: string;
    client_secret: string;
}

export type App = {
    webhook_secret: string;
}

export type Oauth2AppExpanded = {
    client_id: string;
    client_secret: string;
    connect_url: string;
    complete_url: string;
    user?: ZDOauth2User
}

export type Oauth2UserExpanded = {
    user: ZDOauth2User
}

export type CtxExpandedBot = AppContext & {
    bot_user_id: string,
    bot_access_token: string,
}

export type CtxExpandedActingUserAccessToken = AppContext & {
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

export type CtxExpandedAdmin = AppContext & {
    admin_access_token: string
}

export type CtxExpandedPost = AppContext & {
    post: Post
}

export type ExpandedChannel = AppContext & {
    channel: Channel
}

export type ExpandedOauth2User = {
    oauth2: {
        user: ZDOauth2User
    }
}

export type CtxExpandedApp = AppContext & {
    app: App
}

export type CtxExpandedOauth2App = AppContext & {
    oauth2: Oauth2AppExpanded,
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
export type CtxExpandedBotAdminActingUserOauth2User = CtxExpandedActingUser & ExpandedOauth2User
export type CtxExpandedBotAdminActingUserOauth2UserChannel = CtxExpandedActingUser & ExpandedOauth2User & ExpandedChannel
export type CtxExpandedActingUserOauth2App = CtxExpandedActingUser & CtxExpandedOauth2App
export type CtxExpandedActingUserOauth2AppOauth2User = CtxExpandedActingUser & CtxExpandedOauth2App & ExpandedOauth2User
export type CtxExpandedActingUserOauth2AppBot = CtxExpandedActingUser & CtxExpandedOauth2App & CtxExpandedBot
export type CtxExpandedBotActingUserAccessToken = CtxExpandedActingUserAccessToken & CtxExpandedBot
export type CtxExpandedBotApp = CtxExpandedBot & CtxExpandedApp
