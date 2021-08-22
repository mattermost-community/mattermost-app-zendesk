import Client from 'mattermost-redux/client/client4.js';

import {baseUrlFromContext} from '../utils';

export interface MMClient {
    asBot(): Client;
    asAdmin(): Client;
    asActingUser(): Client;
}

export type MMClientOptions = {
    mattermostSiteURL: string,
    actingUserAccessToken: string,
    botAccessToken: string,
    adminAccessToken: string
}

export const newMMClient = (mmOptions: MMClientOptions): MMClient => {
    return new MMClientImpl(mmOptions);
};

class MMClientImpl implements MMClient {
    options: MMClientOptions
    constructor(options: MMClientOptions) {
        this.options = options;
    }
    newClient(token: string): Client {
        const client = new Client();
        const baseURL = baseUrlFromContext(this.options.mattermostSiteURL);
        client.setUrl(baseURL);
        client.setToken(token);
        return client;
    }

    as(token: string): Client {
        return this.newClient(token);
    }

    asBot(): Client {
        return this.as(
            this.options.botAccessToken,
        );
    }

    asAdmin(): Client {
        return this.as(
            this.options.adminAccessToken,
        );
    }

    asActingUser(): Client {
        return this.as(
            this.options.actingUserAccessToken,
        );
    }
}
