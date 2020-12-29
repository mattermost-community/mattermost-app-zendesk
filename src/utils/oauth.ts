import {v4 as uuidv4} from 'uuid';
import {AppContext} from 'mattermost-redux/types/apps';

export function createOAuthState(context: AppContext): string {
    const userID = context.acting_user_id;
    const channelID = context.channel_id;
    return [uuidv4(), userID, channelID].join('_');
}

