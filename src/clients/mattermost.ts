import Client from 'mattermost-redux/client/client4.js';

import {AppContext} from 'mattermost-redux/types/apps';

import {configStore} from '../store';

interface MMClient {
    asBot(): Client;
    asAdmin(): Client;
    asActingUser(context: AppContext): Client;
}

export const newMMClient = (): MMClient => {
    return new MattermostClient();
};

class MattermostClient implements MMClient {
    newClient(userID: string, token: string): Client {
        const client = new Client();
        client.setUrl(configStore.getSiteURL());
        client.setUserId(userID);
        client.setToken(token);
        return client;
    }

    as(id: string, token: string): Client {
        return this.newClient(id, token);
    }

    asBot(): Client {
        return this.as(
            configStore.getBotUserID(),
            configStore.getBotAccessToken(),
        );
    }

    asAdmin(): Client {
        return this.as(
            configStore.getAdminUserID(),
            configStore.getAdminAccessToken(),
        );
    }

    asActingUser(context: AppContext): Client {
        return this.as(
            context.acting_user_id,
            context.acting_user_access_token,
        );
    }
}
