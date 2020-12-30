import ClientOAuth2 from 'client-oauth2';

import {ENV, zendeskClientID, routes as r} from '../utils';
import {getManifest} from '../../manifest';

// TODO install the app via the zendesk API and store secret
export const getOAuthConfig = (): any => {
    const zendeskAuth = new ClientOAuth2({
        clientId: zendeskClientID,
        clientSecret: 'a6db5cbc7b461413197bee1904f47288454724308a5f7e324d1cfed80539cdcb',
        accessTokenUri: ENV.zendesk.host + r.zendesk.OAuthAccessTokenURI,
        authorizationUri: ENV.zendesk.host + r.zendesk.OAuthAuthorizationURI,
        redirectUri: getManifest().root_url + r.OAuthCompletePath,
        scopes: ['read', 'write'],
    });
    return zendeskAuth;
};
