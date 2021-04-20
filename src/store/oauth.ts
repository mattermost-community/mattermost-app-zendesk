import {CtxWithActingUserExpanded} from 'types/apps';

import {newAppsClient, AppsClient} from 'clients';
import {baseUrlFromContext} from 'utils';

export type UserToken = {
    token: string
}

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

export const newTokenStore = (context: CtxWithActingUserExpanded): TokenStore => {
    const botAccessToken = context.acting_user_access_token;
    const baseURL = baseUrlFromContext(context);
    return new TokenStoreImpl(botAccessToken, baseURL);
};

