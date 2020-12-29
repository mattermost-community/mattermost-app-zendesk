import ClientOAuth2 from 'client-oauth2';

import {ENV} from '../utils';

export function getOAuthConfig() {
    const zendeskAuth = new ClientOAuth2({
        clientId: 'mattermost_zendesk_app',
        clientSecret: 'a6db5cbc7b461413197bee1904f47288454724308a5f7e324d1cfed80539cdcb',
        accessTokenUri: 'https://github.com/login/oauth/access_token',
        authorizationUri: 'https://github.com/login/oauth/authorize',
        redirectUri: 'http://example.com/auth/github/callback',
        scopes: ['notifications', 'gist'],
    });
    return zendeskAuth;
}
