import zendesk, {Client, ClientOptions} from 'node-zendesk';

export const newClient = (remoteUri: string, token: string): Client => {
    const options: ClientOptions = {
        username: '',
        token,
        remoteUri,
        oauth: true,
    };

    return zendesk.createClient(options);
};
