import {AppContext} from 'mattermost-redux/types/apps';

import {newProxyClient, ProxyClient} from '../clients';
import {baseUrlFromContext} from '../utils';

interface TokenStore {
    storeToken(userID: string, token: string): Promise<void>;
    deleteToken(userID: string): Promise<void>;
    getToken(userID: string): Promise<string>;
}

// need to add prefix
class TokenStoreImpl implements TokenStore {
    ppClient: ProxyClient

    constructor(botToken: string, baseURL: string) {
        this.ppClient = newProxyClient(botToken, baseURL);
    }

    async storeToken(userID: string, token: string): Promise<void> {
        await this.ppClient.kvSet(userID, {token});
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

