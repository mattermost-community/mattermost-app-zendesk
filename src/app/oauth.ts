import ClientOAuth2 from 'client-oauth2';

export function getOAuthConfig() {
    const zendeskAuth = new ClientOAuth2({
        clientId: 'abc',
        clientSecret: '123',
        accessTokenUri: 'https://github.com/login/oauth/access_token',
        authorizationUri: 'https://github.com/login/oauth/authorize',
        redirectUri: 'http://example.com/auth/github/callback',
        scopes: ['notifications', 'gist'],
    });
}
