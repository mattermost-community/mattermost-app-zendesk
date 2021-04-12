import {v4 as uuidv4} from 'uuid';
import {AppContext} from 'mattermost-redux/types/apps';

import {baseUrlFromContext} from 'utils';

export type parseOAuthStateReturnValue = {
    uuid: string;
    userID: string;
    channelID: string;
    botToken: string;
    url: string;
    err: string;
}

export function createOAuthState(context: AppContext): string {
    const userID = context.acting_user_id;
    const botToken = context.bot_access_token;
    const baseURL = baseUrlFromContext(context);
    const channelID = context.channel_id;
    return [uuidv4(), userID, channelID, botToken, baseURL].join('_');
}

export function parseOAuthState(state: string): parseOAuthStateReturnValue {
    const parsedState: parseOAuthStateReturnValue = {
        uuid: '',
        userID: '',
        channelID: '',
        botToken: '',
        url: '',
        err: '',
    };
    const splitted = state.split('_');
    if (splitted.length !== 5) {
        parsedState.err = 'Bad state';
        return parsedState;
    }

    parsedState.uuid = splitted[0];
    parsedState.userID = splitted[1];
    parsedState.channelID = splitted[2];
    parsedState.botToken = splitted[3];
    parsedState.url = splitted[4];
    return parsedState;
}

