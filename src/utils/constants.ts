export const jsonConfigFileStore = 'config.json';
export const jsonTokenFileStore = 'tokens.json';
export const zdIcon = 'https://raw.githubusercontent.com/mattermost/mattermost-app-zendesk/master/assets/zendesk.svg';
export const zdClientID = 'mattermost_zendesk_app';
export const formTextAreaMaxLength = 1024;

const mmPaths = {
};

const zdPaths = {
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
    zd: zdPaths,
    mm: mmPaths,
    app: appPaths,
};

export const commandLocations = {
    Connect: 'connect',
    Disconnect: 'disconnect',
};

const zdENV = {
    host: process.env.ZD_URL as string,
    apiURL: process.env.ZD_URL + zdPaths.APIVersion as string,
    clientSecret: process.env.ZD_CLIENT_SECRET as string,
};

export const ENV = {
    zd: zdENV,
};

