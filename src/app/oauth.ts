import ClientOAuth2 from 'client-oauth2';

import {ENV, zdClientID, routes as r} from '../utils';
import {getManifest} from '../../manifest';

// TODO install the app via the zendesk API and store secret
export const getOAuthConfig = (): any => {
    const zdAuth = new ClientOAuth2({
        clientId: zdClientID,
        clientSecret: ENV.zd.clientSecret,
        accessTokenUri: ENV.zd.host + r.zd.OAuthAccessTokenURI,
        authorizationUri: ENV.zd.host + r.zd.OAuthAuthorizationURI,
        redirectUri: getManifest().root_url + r.app.OAuthCompletePath,
        scopes: ['read', 'write'],
    });
    return zdAuth;
};
