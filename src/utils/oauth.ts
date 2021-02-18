import {v4 as uuidv4} from 'uuid';
import {AppContext} from 'mattermost-redux/types/apps';

import {baseUrlFromContext} from '../utils';

export function createOAuthState(context: AppContext): string {
    const userID = context.acting_user_id;
    const botToken = context.bot_access_token;
    const baseURL = baseUrlFromContext(context);
    const channelID = context.channel_id;
    return [uuidv4(), userID, channelID, botToken, baseURL].join('_');
}

export function parseOAuthState(state: string): string[] {
    const splitted = state.split('_');
    if (splitted.length !== 5) {
        return ['', '', 'Bad state'];
    }
    return [splitted[1], splitted[2], splitted[3], splitted[4], ''];
}

