import Client from 'mattermost-redux/client/client4.js';

import {AppContext} from 'mattermost-redux/types/apps';

import {baseUrlFromContext} from '../utils';

interface MMClient {
    asBot(): Client;
    asAdmin(): Client;
    asActingUser(context: AppContext): Client;
}

export const newMMClient = (context: AppContext): MMClient => {
    return new MMClientImpl(context);
};

class MMClientImpl implements MMClient {
    context: any
    constructor(context: AppContext) {
        this.context = context;
    }
    newClient(token: string): Client {
        const client = new Client();
        const baseURL = baseUrlFromContext(this.context);
        client.setUrl(baseURL);
        client.setToken(token);
        return client;
    }

    as(token: string): Client {
        return this.newClient(token);
    }

    asBot(): Client {
        return this.as(
            this.context.bot_access_token,
        );
    }

    // TODO: admin vs bot?
    asAdmin(): Client {
        return this.as(
            this.context.bot_access_token,
        );
    }

    asActingUser(context: AppContext): Client {
        return this.as(
            this.context.acting_user_access_token,
        );
    }
}
