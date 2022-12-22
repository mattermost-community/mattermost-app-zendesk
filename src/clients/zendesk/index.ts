import zendesk, {ClientOptions} from 'node-zendesk';

import {Routes} from '../../utils';
import {newConfigStore} from '../../store';

import {ZDClient, ZDClientOptions} from './types';

export const newZDClient = async (zdOptions: ZDClientOptions): Promise<ZDClient> => {
    const token = zdOptions.oauth2UserAccessToken;
    if (!token) {
        throw new Error('Failed to get oauth2 user access_token');
    }
    const config = await newConfigStore(zdOptions.botAccessToken, zdOptions.mattermostSiteUrl).getValues();
    const remoteUri = config.zd_url + Routes.ZD.APIVersion;
    const options: ClientOptions = {
        username: '',
        token,
        remoteUri,
        oauth: true,
    };

    const client = zendesk.createClient(options) as ZDClient;

    return client;
};
