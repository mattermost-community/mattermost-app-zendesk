import {AppContext} from 'mattermost-redux/types/apps';

import {newKVClient, KVClient} from '../clients';
import {baseUrlFromContext} from '../utils';

interface TokenStore {
    storeToken(userID: string, token: string): Promise<void>;
    deleteToken(userID: string): Promise<void>;
    getToken(userID: string): Promise<string>;
}

// need to add prefix
class TokenStoreImpl implements TokenStore {
    kvClient: KVClient

    constructor(botToken: string, baseURL: string) {
        this.kvClient = newKVClient(botToken, baseURL);
    }

    async storeToken(userID: string, token: string): Promise<void> {
        await this.kvClient.set(userID, {token});
    }

    async deleteToken(userID: string): Promise<void> {
        this.kvClient.delete(userID);
    }

    async getToken(userID: string): Promise<string> {
        return this.kvClient.get(userID);
    }
}

export const newTokenStore = (context: AppContext): TokenStore => {
    const botAccessToken = context.bot_access_token;
    const baseURL = baseUrlFromContext(context);
    return new TokenStoreImpl(botAccessToken, baseURL);
};

