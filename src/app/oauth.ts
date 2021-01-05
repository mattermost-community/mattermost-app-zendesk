import ClientOAuth2 from 'client-oauth2';

import {ENV, zendeskClientID, routes as r} from '../utils';
import {getManifest} from '../../manifest';

// TODO install the app via the zendesk API and store secret
export const getOAuthConfig = (): any => {
    const zendeskAuth = new ClientOAuth2({
        clientId: zendeskClientID,
        clientSecret: ENV.zendesk.clientSecret,
        accessTokenUri: ENV.zendesk.host + r.zd.OAuthAccessTokenURI,
        authorizationUri: ENV.zendesk.host + r.zd.OAuthAuthorizationURI,
        redirectUri: getManifest().root_url + r.app.OAuthCompletePath,
        scopes: ['read', 'write'],
    });
    return zendeskAuth;
};
