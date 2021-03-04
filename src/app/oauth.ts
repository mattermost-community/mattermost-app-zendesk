import ClientOAuth2 from 'client-oauth2';

import {Env, Routes} from '../utils';
import {getManifest} from '../manifest';

export const getOAuthConfig = (): any => {
    const zdAuth = new ClientOAuth2({
        clientId: Env.ZD.ClientID,
        clientSecret: Env.ZD.ClientSecret,
        accessTokenUri: Env.ZD.Host + Routes.ZD.OAuthAccessTokenURI,
        authorizationUri: Env.ZD.Host + Routes.ZD.OAuthAuthorizationURI,
        redirectUri: getManifest().root_url + Routes.App.OAuthCompletePath,
        scopes: ['read', 'write'],
    });
    return zdAuth;
};
