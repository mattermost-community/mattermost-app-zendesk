import zendesk, {Client, ClientOptions} from 'node-zendesk';

import {ENV} from '../utils';

export const newClient = (token: string): Client => {
    const options: ClientOptions = {
        username: '',
        token,
        remoteUri: ENV.zd.apiURL,
        oauth: true,
    };

    return zendesk.createClient(options);
};
