import ClientOAuth2 from 'client-oauth2';

import {CtxExpandedActingUser, CtxExpandedActingUserOauth2App} from '../types/apps';

import {Routes} from '../utils';
import {newConfigStore} from '../store';

export const getOAuthConfig = async (context: CtxExpandedActingUserOauth2App): Promise<ClientOAuth2> => {
    const config = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    const cValues = await config.getValues();
    const options = {
        clientId: context.oauth2.client_id,
        clientSecret: context.oauth2.client_secret,
        accessTokenUri: cValues.zd_url + Routes.ZD.OAuthAccessTokenURI,
        authorizationUri: cValues.zd_url + Routes.ZD.OAuthAuthorizationURI,
        redirectUri: context.oauth2.complete_url,
        scopes: ['read', 'write'],
    };

    const zdAuth = new ClientOAuth2(options);
    return zdAuth;
};
