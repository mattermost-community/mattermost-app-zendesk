import {AppFieldTypes} from 'mattermost-redux/constants/apps';
import {AppCallRequest, AppForm, AppField, AppSelectOption} from 'mattermost-redux/types/apps';
import Client4 from 'mattermost-redux/client/client4.js';

import {ZDClientOptions} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';

import {CtxExpandedBotAdminActingUserOauth2User} from '../types/apps';
import {newZDClient, newMMClient, ZDClient} from '../clients';
import {Routes} from '../utils';
import {makeSubscriptionOptions, tryPromiseWithMessage, createZdConditionsFromCall} from '../utils/utils';
import {ZDTrigger, ZDTriggerCondition, ZDTriggerConditions, ZDConditionOption, ZDConditionOptionValue, ZDConditionOptionOperator} from '../utils/ZDTypes';
import {SubscriptionFields, ZendeskIcon} from '../utils/constants';
import {BaseFormFields} from '../utils/base_form_fields';
import {newConfigStore} from '../store';

// newSubscriptionsForm returns a form response to create subscriptions
export async function newSubscriptionsForm(call: AppCallRequest): Promise<AppForm> {
    const context = call.context as CtxExpandedBotAdminActingUserOauth2User;
    const zdOptions: ZDClientOptions = {
        oauth2UserAccessToken: context.oauth2.user.token.access_token,
        botAccessToken: context.bot_access_token,
        mattermostSiteUrl: context.mattermost_site_url,
    };
    const zdClient = await newZDClient(zdOptions);

    const mmOptions: MMClientOptions = {
        mattermostSiteURL: context.mattermost_site_url,
        actingUserAccessToken: context.acting_user_access_token,
        botAccessToken: context.bot_access_token,
        adminAccessToken: context.admin_access_token,
    };
    const config = await newConfigStore(context.bot_access_token, context.mattermost_site_url).getValues();
    const zdHost = config.zd_url;
    const mmClient = newMMClient(mmOptions).asAdmin();

    // definitions will be passed in as call state
    const fetchedConditionOptions = await fetchZDConditions(zdClient, call.state);
    const formFields = new FormFields(call, zdClient, mmClient, zdHost);
    const fields = await formFields.getSubscriptionFields();

    const subOptions = fields.find((field) => field.name === SubscriptionFields.SubSelectName);
    const form: AppForm = {
        title: 'Create or Edit Zendesk Subscriptions',
        header: 'Create or edit channel subscriptions to Zendesk notifications',
        icon: ZendeskIcon,
        submit_buttons: SubscriptionFields.SubmitButtonsName,
        fields,
        call: {
            path: Routes.App.CallPathSubsSubmitOrUpdateForm,
            state: {
                conditions: fetchedConditionOptions,
                triggers: subOptions?.options,
            },
        },
    };
    return form;
}

type ModalState = {
    conditions: ZDConditionOption
}

type FieldOptions = {
    required: boolean,
    type: string,
    index: number
    fieldNameOption: AppSelectOption | undefined
}

type FieldOptionsWithCondition = FieldOptions & {condition: ZDTriggerCondition}

// fetchZDConditions fetches the conditions as defined by the Zendesk instance.
// Conditions are fetched only once when the modal opens and stores in state
const fetchZDConditions = async (zdClient: ZDClient, state: ModalState): Promise<ZDConditionOption> => {
    if (state?.conditions) {
        return state.conditions;
    }

    const req = zdClient.triggers.definitions() || '';
    const definitions = await tryPromiseWithMessage(req, 'Failed to fetch trigger definitions');

    // Any and all share the same conditions.  only save one of them in state
    return definitions[0].definitions.conditions_all;
};

// FormFields retrieves viewable modal app fields. The fields are scoped to the currently viewed channel
class FormFields extends BaseFormFields {
    triggers: ZDTrigger[]
    zdHost: string
    fetchedConditionOptions: ZDConditionOption[]
    savedTriggerConditions: ZDTriggerConditions

    constructor(call: AppCallRequest, zdClient: ZDClient, mmClient: Client4, zdHost: string) {
        super(call, mmClient, zdClient);

        this.triggers = [];
        this.zdHost = zdHost;
        this.fetchedConditionOptions = call.state?.conditions;
        this.savedTriggerConditions = {any: [], all: []};
    }

    async getSubscriptionFields(): Promise<AppField[]> {
        this.triggers = await this.fetchChannelTriggers();
        this.addSubSelectField();

        // only show subscriptions name field until user selects a value
        if (!this.builder.currentFieldValuesAreDefined()) {
            return this.builder.getFields();
        }

        this.savedTriggerConditions = this.getSavedZDConditions();

        // add fields that are dependant on the subscription name
        // provide a text field to add the name of the new subscription
        this.addSubNameTextField();
        this.addConditionsFields();
        this.addSubmitButtons();
        return this.builder.getFields();
    }

    // addConditionFields adds condition fields for a subscription.
    // When the subcription selection changes, values are reset to the defaults
    addConditionsFields(): void {
        const types: string[] = SubscriptionFields.ConditionTypes;
        for (const type of types) {
            this.addConditionsFieldsHeader(type);

            const conditions = this.getConditions(type);
            const numConditions = conditions.length;

            for (let index = 0; index < numConditions; index++) {
                const condition = conditions[index];
                if (!condition) {
                    throw new Error('condition not found');
                }

                const opts: FieldOptionsWithCondition = {
                    condition,
                    fieldNameOption: this.getConditionFieldNameValue(condition),
                    required: index !== numConditions,
                    index,
                    type,
                };

                this.addConditionNameField(opts);

                // the subname dropdown changed, load the saved ZD values
                if (this.subNameDropDownChanged()) {
                    this.initializeModal(opts);
                    continue;
                }

                // update the modal using call values once the modal is loaded with a subscription
                // if field name is selected, show operator field without a value selected
                this.updateModal(opts);
            }

            // always add a new condition field dropdown to the end of a section
            // of conditions, allowing user to add a new condition
            const newOpts: FieldOptions = {
                required: false,
                fieldNameOption: undefined,
                index: numConditions,
                type,
            };
            this.addConditionNameField(newOpts);
        }
    }

    // initializeModal adds condition fields based on the saved Zendesk condition values
    initializeModal(opts: FieldOptionsWithCondition): void {
        const operatorOption = this.getSelectOptionFromCondition(opts.condition);
        this.addConditionOperatorField(operatorOption, opts);
        if (opts.condition.value) {
            this.addConditionValueField(opts);
        }
    }

    // updateModal adds condition fields based on the call values
    updateModal(opts: FieldOptionsWithCondition): void {
        const operatorOption = this.getSelectOptionFromCondition(opts.condition);
        if (this.conditionFieldNameSelected(opts)) {
            this.addConditionOperatorField(undefined, opts);
            return;
        }
        this.addConditionOperatorField(operatorOption, opts);

        // if operator is not terminal, show field to supply field value
        if (!this.isOperatorTerminal(opts.condition)) {
            this.addConditionValueField(opts);
        }
    }

    // subNameDropDownChanged returns true when the subscription name dropdown
    // is changed
    subNameDropDownChanged(): boolean {
        return this.call.selected_field === SubscriptionFields.SubSelectName;
    }

    // getConditions returns an array of ZD triggers conditions. Values come
    // from the saved Zendesk conditions if the subName pull changes.
    // Otherwise they are retrieved from the call values
    getConditions(type: string): ZDTriggerCondition[] {
        if (this.subNameDropDownChanged()) {
            return this.savedTriggerConditions[type];
        }
        return createZdConditionsFromCall(this.call.values, type);
    }

    // addConditionNameField adds a dropdown to select a condition field name
    addConditionNameField(opts: FieldOptions): void {
        const n = opts.index + 1;
        const f: AppField = {
            hint: 'field',
            name: this.getFieldName(opts.type, opts.index, SubscriptionFields.ConditionFieldSuffix),
            type: AppFieldTypes.STATIC_SELECT,
            options: this.makeConditionFieldNameOptions(),
            modal_label: `${n}. ${opts.type.toUpperCase()} Condition`,
            refresh: true,
        };
        if (opts.fieldNameOption) {
            f.value = opts.fieldNameOption;
        }
        this.builder.addFieldToArray(f);
    }

    // addConditionOperatorField adds a dropdown to select an operator condition field
    addConditionOperatorField(value: AppSelectOption | undefined, opts: FieldOptionsWithCondition): void {
        const f: AppField = {
            hint: 'operator',
            name: this.getFieldName(opts.type, opts.index, SubscriptionFields.ConditionOperatorSuffix),
            type: AppFieldTypes.STATIC_SELECT,
            options: this.makeConditionOperationOptions(opts.condition.field),
            refresh: true,
            is_required: opts.required,
        };
        if (value) {
            f.value = value;
        }
        this.builder.addFieldToArray(f);
    }

    // addConditionValueField adds a field to select an available value through
    // a dropdown, or type a text value
    addConditionValueField(opts: FieldOptionsWithCondition) {
        const field = opts.condition.field;
        const condition = this.fetchedConditionOptions.find((c: ZDConditionOption) => {
            return c.subject.toString() === field;
        });

        const f: AppField = {
            type: AppFieldTypes.TEXT,
            hint: 'value',
            name: this.getFieldName(opts.type, opts.index, SubscriptionFields.ConditionValueSuffix),
            is_required: opts.required,
        };
        const value = opts.condition.value;
        if (value) {
            f.value = value;
        }

        // if the condition has values, it is a select field
        if (condition?.values) {
            f.type = AppFieldTypes.STATIC_SELECT;
            f.options = this.makeConditionValueOptions(condition);
            if (value) {
                f.value = this.getConditionOptionValue(f.options, value);
            }
        }
        this.builder.addField(f);
    }

    // getFieldName returns the string name for a given App field
    getFieldName(type: string, index: number, name: string): string {
        return `${type}_${index}_${name}`;
    }

    // getConditions returns an array of Zendesk "any" or "all" trigger conditions for
    // the selected subscription
    getSavedZDConditions(): ZDTriggerConditions {
        if (this.getSelectedSubTrigger() && this.getSelectedSubTrigger().conditions) {
            return this.getSelectedSubTrigger().conditions;
        }
        const emptyConditions: ZDTriggerConditions = {
            any: [],
            all: [],
        };
        return emptyConditions;
    }

    // addConditionsFieldsHeader adds a markdown field for a section of conditions
    addConditionsFieldsHeader(type: string): void {
        const md = [
            `#### Meet \`${type.toUpperCase()}\` of the following conditions`,
            '---',
        ].join('\n');

        const f: AppField = {
            name: type + 'fields',
            type: 'markdown',
            description: md,
        };
        this.builder.addField(f);
    }

    // addNewSubTextField adds a field for adding or editing a subscription name
    addSubNameTextField(): void {
        const f: AppField = {
            name: SubscriptionFields.SubTextName,
            type: AppFieldTypes.TEXT,
            label: SubscriptionFields.SubTextLabel,
            is_required: true,
            max_length: SubscriptionFields.MaxTitleNameLength,
            hint: SubscriptionFields.NewSub_Hint,
        };
        if (this.getSubNameValue()) {
            f.value = this.getSubNameValue();
        }
        this.builder.addFieldToArray(f);
    }

    // getSubNameValue retruns value of the sub name text field
    getSubNameValue(): string {
        const selectedDropDownName = this.getSelectedSubTriggerName();
        if (this.subNameDropDownChanged()) {
            // reset to empty for new sub creation
            if (this.isNewSub()) {
                return '';
            }

            // default to the subname drop down value for existing sub
            return selectedDropDownName;
        }

        // if any other selection changes, keep the previous value
        if (this.call.values) {
            return this.call.values[SubscriptionFields.SubTextName];
        }
        return selectedDropDownName;
    }

    // add addSubSelectField adds the subscription selector modal field
    addSubSelectField(): void {
        // first option is to create new subscription
        const newSubOption = {
            label: SubscriptionFields.NewSub_OptionLabel,
            value: SubscriptionFields.NewSub_OptionValue,
        };
        const subsOptions = makeSubscriptionOptions(this.triggers);
        const options = [
            newSubOption,
            ...subsOptions,
        ];

        const f: AppField = {
            name: SubscriptionFields.SubSelectName,
            modal_label: SubscriptionFields.SubSelectLabel,
            type: AppFieldTypes.STATIC_SELECT,
            options,
            is_required: true,
            refresh: true,
        };
        this.builder.addField(f);
    }

    // conditionFieldNameSelected returns true if the field name value was changed
    conditionFieldNameSelected(opts: FieldOptions): boolean {
        const fieldName = this.getFieldName(opts.type, opts.index, SubscriptionFields.ConditionFieldSuffix);
        return this.call.selected_field === fieldName;
    }

    // isNewSub returns true when "Create New" is selected in the "Subscription Name" dropdown
    isNewSub(): boolean {
        if (this.call.values) {
            const subNameValue = this.call.values[SubscriptionFields.SubSelectName].value;
            return subNameValue === SubscriptionFields.NewSub_OptionValue;
        }
        return false;
    }

    getSelectedSubTrigger(): ZDTrigger {
        const subID = this.getSelectedSubTriggerID();
        return this.getSubTriggerByID(subID);
    }

    getSelectedSubTriggerID(): string {
        return this.builder.getFieldValueByName(SubscriptionFields.SubSelectName) as string;
    }

    getSelectedSubTriggerName(): string {
        return this.builder.getFieldLabelByName(SubscriptionFields.SubSelectName);
    }

    getSubTriggerByID(subID: string): ZDTrigger {
        const trigger = this.triggers.find((t: ZDTrigger) => t.id.toString() === subID);
        if (!trigger && !this.isNewSub()) {
            throw new Error('unable to get trigger by ID ' + subID);
        }
        return trigger as ZDTrigger;
    }

    // makeConditionFieldNameOptions returns an array of available field name options
    makeConditionFieldNameOptions(): AppSelectOption[] {
        return this.fetchedConditionOptions.map((option: ZDConditionOption) => ({
            label: option.title,
            value: option.subject,
        }));
    }

    // makeConditionOperationOptions returns an array of available operator options
    makeConditionOperationOptions(field: string): AppSelectOption[] {
        const operators = this.getConditionFromConditionOptions(field).operators;
        return operators.map((option: ZDConditionOptionOperator) => ({
            label: option.title,
            value: option.value,
        }));
    }

    // makeConditionValueOptions returns an array of available operator value options
    makeConditionValueOptions(condition: ZDConditionOption): AppSelectOption[] {
        if (!condition.values) {
            return [];
        }
        const fields = condition.values.map((option: ZDConditionOptionValue) => ({
            label: option.title,
            value: option.value,
        }));
        return fields;
    }

    // getConditionFieldNameValue returns the value of a selected condition field name
    getConditionFieldNameValue(option: ZDTriggerCondition): AppSelectOption | undefined {
        const fieldOptions = this.makeConditionFieldNameOptions();
        const field = option.field;
        const value = fieldOptions.find((f: AppSelectOption) => {
            return f.value.toString() === field;
        });
        return value;
    }

    // getConditionOptionValueValue returns the value of a selected condition operator field
    getConditionOptionValue(fieldOptions: AppSelectOption[], option: string): AppSelectOption | undefined {
        const value = fieldOptions.find((f: AppSelectOption) => {
            return f.value.toString() === option;
        });
        return value;
    }

    // getSelectOptionFromCondition returns the value of a condition operator value field
    getSelectOptionFromCondition(condition: ZDTriggerCondition): AppSelectOption | undefined {
        const operatorOptions = this.makeConditionOperationOptions(condition.field);
        const operatorOption = operatorOptions.find((option: AppSelectOption) => {
            return option.value.toString() === condition.operator;
        });
        return operatorOption;
    }

    // getConditionFromConditionOptions returns a condition option based on the
    // selected condition operator value
    getConditionFromConditionOptions(subject: string): ZDConditionOption {
        const condition = this.fetchedConditionOptions.find((c: ZDConditionOption) => {
            return c.subject.toString() === subject;
        });
        return condition as ZDConditionOption;
    }

    // isOperatorTerminal returns true when if the condition operator does not require a value
    // Example: condition operator is 'changed' vs condition operator is 'has value'
    isOperatorTerminal(condition: ZDTriggerCondition): boolean {
        if (condition.field) {
            const condOption = this.getConditionFromConditionOptions(condition.field);
            const operators: ZDConditionOptionOperator[] = condOption.operators;
            const operator = operators.find((option: ZDConditionOptionOperator) => {
                return option.value.toString() === condition.operator;
            });
            return Boolean(operator?.terminal);
        }
        return false;
    }

    // fetchChannelTriggers gets all the channel triggers saved in Zendesk via the ZD client
    async fetchChannelTriggers(): Promise<ZDTrigger[]> {
        // modified node-zendesk to allow hitting triggers/search api
        // returns all triggers for all current channel
        const search = [
            SubscriptionFields.PrefixTriggersTitle,
            SubscriptionFields.RegexTriggerInstance,
            this.call.context.mattermost_site_url,
            SubscriptionFields.RegexTriggerTeamID,
            this.call.context.team_id,
            SubscriptionFields.RegexTriggerChannelID,
            this.call.context.channel_id,
        ].join('');

        const client = this.zdClient as ZDClient;
        const searchReq = client.triggers.search(search) || '';
        return tryPromiseWithMessage(searchReq, 'Failed to fetch triggers');
    }

    // addSubmitButtons adds a delete button in addition to the save button
    addSubmitButtons(): void {
        const options = SubscriptionFields.SubmitButtonsOptions;
        const f: AppField = {
            name: SubscriptionFields.SubmitButtonsName,
            type: AppFieldTypes.STATIC_SELECT,
            options,
        };
        this.builder.addField(f);
    }
}
