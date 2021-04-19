import {AppContext} from 'mattermost-redux/types/apps';

import {newAppsClient, AppsClient} from '../clients';
import {baseUrlFromContext} from '../utils';

interface TokenStore {
    deleteToken(userID: string): Promise<void>;
    getToken(userID: string): Promise<string>;
}

// need to add prefix
class TokenStoreImpl implements TokenStore {
    ppClient: AppsClient

    constructor(botToken: string, baseURL: string) {
        this.ppClient = newAppsClient(botToken, baseURL);
    }

    async deleteToken(userID: string): Promise<void> {
        this.ppClient.kvDelete(userID);
    }

    async getToken(userID: string): Promise<string> {
        return this.ppClient.kvGet(userID);
    }
}

export const newTokenStore = (context: AppContext): TokenStore => {
    const botAccessToken = context.bot_access_token;
    const baseURL = baseUrlFromContext(context);
    return new TokenStoreImpl(botAccessToken, baseURL);
};

