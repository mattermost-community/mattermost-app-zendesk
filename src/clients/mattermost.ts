import Client from 'mattermost-redux/client/client4.js';

import {configStore} from '../store';

export const newMMClient = (token: string): Client => {
    const client = new Client();
    client.setUrl(configStore.getSiteURL());
    client.setToken(token);
    return client;
};
