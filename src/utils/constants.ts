export const jsonConfigFileStore = 'config.json';
export const jsonTokenFileStore = 'tokens.json';
export const zendeskIcon = 'https://raw.githubusercontent.com/mattermost/mattermost-app-zendesk/main/assets/zendesk.svg';
export const zendeskClientID = 'mattermost_zendesk_app';

const zendesk = {
    host: process.env.ZENDESK_URL as string,
    apiURL: process.env.ZENDESK_URL + '/api/v2' as string,
    apiToken: process.env.ZENDESK_API_TOKEN as string,
    username: process.env.ZENDESK_USERNAME as string,
};

export const ENV = {
    zendesk,
};

export const zendeskPaths = {
    OAuthAuthorizationURI: '/oauth/authorizations/new',
    OAuthAccessTokenURI: '/oauth/tokens',
};

export const routes = {
    zendesk: zendeskPaths,
    ManifestPath: '/manifest.json',
    InstallPath: '/install',
    BindingsPath: '/bindings',

    OAuthCompletePath: '/oauth/complete',

    BindingPathCreateForm: '/create',
    BindingPathConnect: '/connect',
    BindingPathDisconnect: '/disconnect',
};

export const commandLocations = {
    locationConnect: 'connect',
    locationDisconnect: 'disconnect',
};
