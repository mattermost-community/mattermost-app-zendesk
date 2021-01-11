import {oauth} from '../store';

export function isUserConnected(userID: string): string {
    return oauth.getToken(userID);
}

