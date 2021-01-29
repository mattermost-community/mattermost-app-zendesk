export const jsonConfigFileStore = 'config.json';
export const jsonTokenFileStore = 'tokens.json';
export const ZDIcon = 'https://raw.githubusercontent.com/mattermost/mattermost-app-zendesk/master/assets/zendesk.svg';
export const ZDClientID = 'mattermost_zendesk_app';

export const FormTextAreaMaxLength = 1024;

// Routes to the Mattermost Instance
const MMPaths = {
};

// Routes to the Zendesk Instance
const ZDPaths = {
    OAuthAuthorizationURI: '/oauth/authorizations/new',
    OAuthAccessTokenURI: '/oauth/tokens',
    APIVersion: '/api/v2',
};

// Routes to the Zendesk App Instance
const AppPaths = {
    ManifestPath: '/manifest.json',
    InstallPath: '/install',

    OAuthCompletePath: '/oauth/complete',

    // Binding routes are accessed via a location call
    BindingsPath: '/bindings',
    BindingPathOpenCreateTicketForm: '/open-create-ticket-form',
    BindingPathConnect: '/connect',
    BindingPathDisconnect: '/disconnect',

    // Call routes are callable routes, but not bound to a location
    CallPathSubmitOrUpdateCreateTicketForm: '/submit-or-update-create-ticket-form',
};

export const Routes = {
    ZD: ZDPaths,
    MM: MMPaths,
    App: AppPaths,
};

export const CommandLocations = {
    Connect: 'connect',
    Disconnect: 'disconnect',
};

const ZDEnv = {
    Host: process.env.ZD_URL as string,
    ApiURL: process.env.ZD_URL + ZDPaths.APIVersion as string,
    ClientSecret: process.env.ZD_CLIENT_SECRET as string,
};

export const Env = {
    ZD: ZDEnv,
};

// Fields available inside Zendesk
export const ZDFieldTypes = {

    // System Types
    // Assignee: 'assignee',
    Subject: 'subject',
    Priority: 'priority',
    TicketType: 'tickettype',
    Description: 'description',

    // Custom Zendesk UserField Types
    Text: 'text',
    MultiLine: 'textarea',
    Checkbox: 'checkbox',
    Date: 'date',
    Integer: 'integer',
    Decimal: 'decimal',
    Regex: 'regexp',
    Tagger: 'tagger',
    Muliselect: 'multiselect',
};

export const AppFieldNames = {
    AdditionalMessage: 'additional_message',
    PostMessage: 'post_message',
    FormsSelectName: 'ticket_form_id',

    CustomFieldPrefix: 'custom_field_',
};

// ZdFieldValidation is an object of Zendesk fields types that validates a field
// value against a regex.  The regex values are retreivable from the field
// list API, but are hardcoded here for simplicity
export const ZDFieldValidation = {};
ZDFieldValidation[ZDFieldTypes.Integer] = {
    Regex: '^[+-]?\\d+$',
    RegexError: 'Numeric field not valid',
};
ZDFieldValidation[ZDFieldTypes.Decimal] = {
    Regex: '^[-+]?[0-9]*[.,]?[0-9]+$',
    RegexError: 'Decimal field not valid',
};
ZDFieldValidation[ZDFieldTypes.Date] = {
    Regex: '^([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])$',
    RegexError: 'Date field not valid',
};
ZDFieldValidation[ZDFieldTypes.Regex] = {
    Regex: '^(http|https):\\/\\/[a-z0-9]+([-.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(([0-9]{1,5})?\\/.*)?$',
    RegexError: 'Regex field not valid',
};

// MappedZDNames are field names that need to be remapped before sending as a
// field name for the app modal.
export const MappedZDNames = { };
MappedZDNames[ZDFieldTypes.TicketType] = 'type';

export const SystemFields = ['subject'];
