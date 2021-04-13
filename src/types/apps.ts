import {UserProfile} from 'mattermost-redux/types/users';
import {Post} from 'mattermost-redux/types/posts';
import {AppContext} from 'mattermost-redux/types/apps';

export type CtxWithBotExpanded = AppContext & {
    bot_user_id: string,
    bot_access_token: string,
}

export type CtxWithBotAdminActingUserExpanded = AppContext & {
    acting_user: UserProfile,
    acting_user_id: string,
    acting_user_access_token: string
    admin_access_token: string
    bot_user_id: string,
    bot_access_token: string,
}

export type CtxWithPostExpanded = AppContext & {
    post: Post
}

export type CtxWithActingUserExpanded = AppContext & {
    acting_user: UserProfile,
    acting_user_id: string,
    acting_user_access_token: string
}
