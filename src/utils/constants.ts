export const jsonConfigFileStore = 'config.json';
export const jsonTokenFileStore = 'tokens.json';
export const ZDIcon = 'https://raw.githubusercontent.com/mattermost/mattermost-app-zendesk/master/assets/zendesk.svg';
export const AppID = 'zendesk';

export const FormTextAreaMinLength = 2;
export const FormTextAreaMaxLength = 1024;

// Routes to the Mattermost Instance
const MMPaths = {
};

// Routes to the Zendesk Instance
const ZDPaths = {
    OAuthAuthorizationURI: '/oauth/authorizations/new',
    OAuthAccessTokenURI: '/oauth/tokens',
    TicketPathPrefix: '/agent/tickets',
    APIVersion: '/api/v2',
};

// Routes to the Zendesk App Instance
const AppPaths = {
    ManifestPath: '/manifest.json',
    InstallPath: '/install',

    OAuthCompletePath: '/oauth/complete',
    SubscribeIncomingWebhookPath: '/webhook-incoming',

    // Binding routes are accessed via a location call
    BindingsPath: '/bindings',
    BindingPathOpenCreateTicketForm: '/open-create-ticket-form',
    BindingPathOpenSubcriptionsForm: '/open-subscriptions-form',
    BindingPathConnect: '/connect',
    BindingPathDisconnect: '/disconnect',
    BindingPathHelp: '/help',

    // Call routes are callable routes, but not bound to a location
    CallPathSubmitOrUpdateCreateTicketForm: '/submit-or-update-create-ticket-form',
    CallPathSubmitOrUpdateSubcriptionForm: '/submit-or-update-subcription-form',
};

export const Routes = {
    ZD: ZDPaths,
    MM: MMPaths,
    App: AppPaths,
};

export const CommandLocations = {
    Connect: 'connect',
    Disconnect: 'disconnect',
    Subscribe: 'subscribe',
    Help: 'help',
};

const ZDEnv = {
    Host: process.env.ZD_URL as string,
    ApiURL: process.env.ZD_URL + ZDPaths.APIVersion as string,
    ClientSecret: process.env.ZD_CLIENT_SECRET as string,
    ClientID: process.env.ZD_CLIENT_ID as string,
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

export const CreateTicketFields = {
    NameAdditionalMessage: 'additional_message',
    NamePostMessage: 'post_message',
    NameFormsSelect: 'ticket_form_id',
    PrefixCustomField: 'custom_field_',
};

export const SubscriptionFields = {
    ChannelPickerSelect_Label: 'Channel Name',
    ChannelPickerSelect_Name: 'channel_picker_name',

    SubSelect_Label: 'Subscription Name',
    SubSelect_Name: 'subcription_select_name',

    // UnsupportedFieldsText_Label: 'un',
    UnsupportedFieldsText_Name: 'unsupported_fields',

    SubText_Label: 'Name',
    SubText_Name: 'subscription_text_name',

    SubmitButtonsName: 'button_action',
    DeleteButtonLabel: 'Delete',
    SaveButtonLabel: 'Save',

    NewSub_OptionValue: 'newsubscription',
    NewSub_OptionLabel: 'New Subscription',

    PrefixTriggersTitle: '__mm_webhook__channelID:',
    RegexTriggerTitle: '__mm_webhook__channelID:(\\w+) (.*)',

    // TODO add ticket is created and ticket is updated options
    ConditionsCheckBoxFields: [
        'status',
        'priority',
        'brand',
        'form',
        'type',
        'group',
        'assignee',
        'requester',
        'organization',
    ],
};

// SubscriptionFields.SubmitButtonOptions = {};
SubscriptionFields.SubmitButtonsOptions = [
    {
        label: SubscriptionFields.DeleteButtonLabel,
        value: SubscriptionFields.DeleteButtonLabel,
    },
    {
        label: SubscriptionFields.SaveButtonLabel,
        value: SubscriptionFields.SaveButtonLabel,
    },
];

export const TriggerFields = {
    TicketIDKey: 'ticketID',
    ChannelIDKey: 'channelID',
    ActionField: 'notification_target',
    ActionValuePairs: {},

    // TODO this is the target id value. Need to store this value when creating the
    // target through the app, or when the user has to create target in zendesk
    TargetID: 360002371891,
};

// ActionValuePairs is an object of static key value pairs that will be added to a
// trigger when saving in Zendesk
TriggerFields.ActionValuePairs[TriggerFields.TicketIDKey] = '{{ticket.id}}';

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
