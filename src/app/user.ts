import {oauthStore} from '../store';

export function isUserConnected(userID: string): string {
    return oauthStore.getToken(userID);
}

