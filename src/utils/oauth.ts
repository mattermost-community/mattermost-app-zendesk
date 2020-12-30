import {v4 as uuidv4} from 'uuid';
import {AppContext} from 'mattermost-redux/types/apps';

export function createOAuthState(context: AppContext): string {
    const userID = context.acting_user_id;
    const channelID = context.channel_id;
    return [uuidv4(), userID, channelID].join('_');
}

export function parseOAuthState(state: string): string[] {
    const splitted = state.split('_');
    if (splitted.length !== 3) {
        return ['', '', 'Bad state'];
    }
    return [splitted[1], splitted[2], ''];
}

