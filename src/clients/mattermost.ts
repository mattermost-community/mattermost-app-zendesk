import Client from 'mattermost-redux/client/client4.js';

export const newClient = (url: string, token: string): Client => {
    const client = new Client();
    client.setUrl(url);
    client.setToken(token);
    return client;
};
