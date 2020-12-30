import ClientOAuth2 from 'client-oauth2';

import {ENV} from '../utils';
import {getManifest} from '../../manifest';

export const getOAuthConfig = (): any => {
    const zendeskAuth = new ClientOAuth2({
        clientId: 'mattermost_zendesk_app',
        clientSecret: 'a6db5cbc7b461413197bee1904f47288454724308a5f7e324d1cfed80539cdcb',
        accessTokenUri: ENV.zendesk.host + '/oauth/tokens',
        authorizationUri: ENV.zendesk.host + '/oauth/authorizations/new',
        redirectUri: getManifest().root_url + '/complete',
        scopes: ['read', 'write'],
    });
    return zendeskAuth;
};
