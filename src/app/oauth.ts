import ClientOAuth2 from 'client-oauth2';
import {AppContextWithBot} from 'types/apps';

import {Routes} from '../utils';
import {newConfigStore} from '../store';

export const getOAuthConfig = async (context: AppContextWithBot): Promise<ClientOAuth2> => {
    const config = await newConfigStore(context).getValues();
    const zdAuth = new ClientOAuth2({
        clientId: config.zd_client_id,
        clientSecret: config.zd_client_secret,
        accessTokenUri: config.zd_url + Routes.ZD.OAuthAccessTokenURI,
        authorizationUri: config.zd_url + Routes.ZD.OAuthAuthorizationURI,
        redirectUri: config.zd_node_host + Routes.App.OAuthCompletePath,
        scopes: ['read', 'write'],
    });
    return zdAuth;
};
