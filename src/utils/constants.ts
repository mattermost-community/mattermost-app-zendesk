export const jsonConfigFileStore = 'config.json';
export const jsonTokenFileStore = 'tokens.json';
export const zendeskIcon = 'https://raw.githubusercontent.com/mattermost/mattermost-app-zendesk/master/assets/zendesk.svg';
export const zendeskClientID = 'mattermost_zendesk_app';
export const formTextAreaMaxLength = 1024;

const mattermostPaths = {
};

const zendeskPaths = {
    OAuthAuthorizationURI: '/oauth/authorizations/new',
    OAuthAccessTokenURI: '/oauth/tokens',
    APIVersion: '/api/v2',
};

const appPaths = {
    ManifestPath: '/manifest.json',
    InstallPath: '/install',

    OAuthCompletePath: '/oauth/complete',

    BindingsPath: '/bindings',
    BindingPathCreateForm: '/create',
    BindingPathConnect: '/connect',
    BindingPathDisconnect: '/disconnect',
};

export const routes = {
    zd: zendeskPaths,
    mm: mattermostPaths,
    app: appPaths,
};

export const commandLocations = {
    Connect: 'connect',
    Disconnect: 'disconnect',
};

const zendeskENV = {
    host: process.env.ZENDESK_URL as string,
    apiURL: process.env.ZENDESK_URL + zendeskPaths.APIVersion as string,
    clientSecret: process.env.ZENDESK_CLIENT_SECRET as string,
};

export const ENV = {
    zendesk: zendeskENV,
};

