import ClientOAuth2 from 'client-oauth2';
import {AppContext} from 'mattermost-redux/types/apps';

import {Routes} from '../utils';
import {newConfigStore} from '../store';

export const getOAuthConfig = async (context: AppContext): any => {
    const config = await newConfigStore(context).getValues();
    const options = {
        clientId: context.oauth2.client_id,
        clientSecret: context.oauth2.client_secret,
        accessTokenUri: config.zd_url + Routes.ZD.OAuthAccessTokenURI,
        authorizationUri: config.zd_url + Routes.ZD.OAuthAuthorizationURI,
        redirectUri: context.oauth2.complete_url,
        scopes: ['read', 'write'],
    };

    const zdAuth = new ClientOAuth2(options);
    return zdAuth;
};
