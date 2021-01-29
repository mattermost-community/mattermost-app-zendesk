import {AppBinding} from 'mattermost-redux/types/apps';

import {commandBindings} from './slash_commands';
import {postMenuBindings} from './post_menu';

// getBindings returns bindings defined for all locations in the app
export const getBindings = (userID: string): AppBinding[] => {
    return [
        postMenuBindings(userID),
        commandBindings(userID),
    ] as AppBinding[];
};

