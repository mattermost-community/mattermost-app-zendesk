export const ZDIcon = 'https://raw.githubusercontent.com/mattermost/mattermost-app-zendesk/master/assets/zendesk.svg';
export const CommandTrigger = 'zendesk';

export const FormTextAreaMinLength = 2;
export const FormTextAreaMaxLength = 1024;

import {AppSelectOption} from 'mattermost-redux/types/apps';

// Routes to the Mattermost Instance
const MMPaths = {
    KVPath: '/plugins/com.mattermost.apps/api/v1/kv/',
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

    OAuthCompletePath: '/oauth2/complete',
    OAuthRedirectPath: '/oauth2/redirect',
    SubscribeIncomingWebhookPath: '/webhook-target',

    // Binding routes are accessed via a location call
    BindingsPath: '/bindings',

    // Ticket Creation
    CallPathTicketOpenForm: '/ticket/open-form',
    CallPathTicketSubmitOrUpdateForm: '/ticket/submit-or-update',

    // Subscriptions
    CallPathSubsOpenForm: '/subscriptions/open-form',
    CallPathSubsSubmitOrUpdateForm: '/subscriptions/submit-or-update',

    // Zendesk Configuration
    CallPathConfigOpenForm: '/config/open-form',
    CallPathConfigSubmitOrUpdateForm: '/config/submit-or-update',

    BindingPathConnect: '/connect',
    BindingPathDisconnect: '/disconnect',
    BindingPathHelp: '/help',
};

export const Routes = {
    ZD: ZDPaths,
    MM: MMPaths,
    App: AppPaths,
};

export const CommandLocations = {
    Connect: 'connect',
    Configure: 'configure',
    Disconnect: 'disconnect',
    Subscribe: 'subscribe',
    Ticket: 'ticket',
    Help: 'help',
};

export const StoreKeys = {
    config: 'config',
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

const selectOptions: AppSelectOption[] = [];
export const SubscriptionFields = {
    ChannelPickerSelectLabel: 'Channel Name',
    ChannelPickerSelectName: 'channel_picker_name',

    SubSelectLabel: 'Subscription Name',
    SubSelectName: 'subscription_select_name',

    UnsupportedFieldsTextName: 'unsupported_fields',

    SubTextLabel: 'Name',
    SubTextName: 'subscription_text_name',

    DeleteButtonLabel: 'Delete',
    SubmitButtonsName: 'button_action',
    SubmitButtonsOptions: selectOptions,
    SaveButtonLabel: 'Save',

    NewSub_OptionLabel: 'New Subscription',
    NewSub_OptionValue: 'newsubscription',

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
