import zendesk, {Client, ClientOptions} from 'node-zendesk';

export const newClient = (token: string, remoteUri: string): Client => {
    const options: ClientOptions = {
        token,
        remoteUri,
        oauth: true,
    };

    return zendesk.createClient(options);
};
