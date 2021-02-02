import zendesk, {Client, ClientOptions} from 'node-zendesk';

import {Env} from '../utils';

export const newZDClient = (token: string): Client => {
    const options: ClientOptions = {
        username: '',
        token,
        remoteUri: Env.ZD.ApiURL,
        oauth: true,
    };

    return zendesk.createClient(options) as Client;
};
