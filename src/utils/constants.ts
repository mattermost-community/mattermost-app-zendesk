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

export const zdTypes = {

    // System Types
    // zdTypeAssignee: 'assignee',
    zdTypeSubject: 'subject',
    zdTypePriority: 'priority',
    zdTypeTicketType: 'tickettype',
    zdTypeDescription: 'description',

    // Custom Zendesk UserField Types
    zdTypeText: 'text',
    zdTypeMultiLine: 'textarea',
    zdTypeCheckbox: 'checkbox',
    zdTypeDate: 'date',
    zdTypeInteger: 'integer',
    zdTypeDecimal: 'decimal',
    zdTypeRegex: 'regexp',
    zdTypeTagger: 'tagger',
    zdTypeMuliselect: 'multiselect',
};

export const fieldNames = {
    additionalMessage: 'additional_message',
    postMessage: 'post_message',
    formsSelectName: 'ticket_form_id',

    customFieldPrefix: 'custom_field_',
};

// fieldValidation is an object of Zendesk fields types that validates a field
// value against a regex .  The regex values are retreiveable from the field
// list API, but are hardcoded here for simplicity
export const fieldValidation = {
    integer: {
        regex: '^[+-]?\\d+$',
        regexError: 'Numeric field not valid',
    },
    decimal: {
        regex: '^[-+]?[0-9]*[.,]?[0-9]+$',
        regexError: 'Decimal field not valid',
    },
};

// mappedZDNames are field names that need to be remapped before sending as a
// field name for the app modal.
export const mappedZDNames = { };
mappedZDNames[zdTypes.zdTypeTicketType] = 'type';

export const systemFields = ['subject'];
