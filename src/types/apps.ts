import {AppContext} from 'mattermost-redux/types/apps';

export type AppContextWithBot = AppContext & {
    bot_access_token: string,
    acting_user_id: string,
    acting_user_access_token: string
}
