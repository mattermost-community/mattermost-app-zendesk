import {AppCallRequest, AppForm, AppField, AppSelectOption} from 'mattermost-redux/types/apps';

import {AppFieldTypes} from 'mattermost-redux/constants/apps';
import Client4 from 'mattermost-redux/client/client4.js';

import {CtxExpandedBotAdminActingUserOauth2User} from '../types/apps';
import {newZDClient, newMMClient, ZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';
import {Routes} from '../utils';
import {makeSubscriptionOptions, tryPromiseWithMessage, getConditionFieldsFromCallValues} from '../utils/utils';
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
    const fields = await formFields.addSubscriptionFields();

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
            },
        },
    };
    return form;
}

type ModalState = {conditions: ZDConditionOption}

// fetchZDConditions fetches the conditions as defined by the zendesk instance.
// conditions are only once when the modal opens and stores in state
const fetchZDConditions = async (zdClient: ZDClient, state: ModalState): Promise<ZDConditionOption> => {
    if (state?.conditions) {
        return state.conditions;
    }

    const req = zdClient.triggers.definitions() || '';
    const definitions = await tryPromiseWithMessage(req, 'Failed to fetch trigger definitions');

    // any and all share the same conditions.  only save one of them in state
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

    async addSubscriptionFields(): Promise<AppField[]> {
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

    // addConditionFields adds condition fields for a subscription
    // - When subcription selection changes, defaults are reset
    //   - if has saved ZD trigger, set to those values
    addConditionsFields(): void {
        const types: string[] = SubscriptionFields.ConditionTypes;
        for (const type of types) {
            this.addConditionsFieldsHeader(type);

            // load the saved Zendesk subscription
            if (this.call.selected_field === SubscriptionFields.SubSelectName) {
                this.addSavedZendeskFields(type);
                continue;
            }

            // update the modal using call values once the modal is loaded with a subscription
            this.updateConditionFields(type);
        }
    }

    addSavedZendeskFields(type: string) {
        const numConditions = this.savedTriggerConditions[type].length;
        for (let index = 0; index < numConditions; index++) {
            const condition = this.savedTriggerConditions[type][index];
            const fieldNameValue = this.getOptionValue(condition);
            this.addConditionNameField(fieldNameValue, type, index);

            const operatorOptions = this.makeConditionOperationOptions(condition.field);
            const savedOperatorOption = operatorOptions.find((option: AppSelectOption) => {
                return option.value.toString() === condition.operator;
            });
            const required = index !== numConditions;
            this.addConditionOperatorField(condition.field, savedOperatorOption, required, type, index);
            if (condition.value) {
                this.addConditionValueField(condition.field, condition.value, required, type, index);
            }
        }
        this.addConditionNameField(undefined, type, numConditions);
    }

    updateConditionFields(type: string) {
        const conditions = getConditionFieldsFromCallValues(this.call.values, type);
        const numConditions = Object.keys(conditions).length;
        for (let index = 0; index < numConditions; index++) {
            const condition = conditions[index];
            const fieldNameValue = condition.field;
            this.addConditionNameField(fieldNameValue, type, index);

            const required = index !== numConditions;
            if (condition.field) {
                // if selected field is the field name, reset the operator  field
                if (this.call.selected_field === this.getFieldName(type, index, SubscriptionFields.ConditionFieldSuffix)) {
                    this.addConditionOperatorField(condition.field.value, undefined, required, type, index);
                    continue;
                }

                this.addConditionOperatorField(condition.field.value, condition.operator, required, type, index);
                const condOption = this.getConditionFromConditionsOptions(condition.field.value);
                const operators: ZDConditionOptionOperator[] = condOption.operators;
                const operator = operators.find((option: ZDConditionOptionOperator) => {
                    return option.value.toString() === condition.operator?.value;
                });
                if (operator) {
                    const isTerminal = operator.terminal;
                    if (!isTerminal) {
                        this.addConditionValueField(condition.field.value, condition.value, required, type, index);
                    }
                }
            }
        }
    }

    addConditionNameField(fieldNameValue: AppSelectOption | undefined, type: string, index: number): void {
        const fieldNameOptions = this.makeConditionFieldNameOptions();
        const n = index + 1;
        const f: AppField = {
            hint: 'field',
            name: this.getFieldName(type, index, SubscriptionFields.ConditionFieldSuffix),
            type: AppFieldTypes.STATIC_SELECT,
            options: fieldNameOptions,
            label: `${n}. ${type.toUpperCase()} Condition`,
            refresh: true,
        };

        if (fieldNameValue) {
            f.value = fieldNameValue;
        }
        this.builder.addFieldToArray(f);
    }

    getFieldName(type: string, i: number, name: string): string {
        return type + '_' + i + '_' + name;
    }

    addConditionOperatorField(fieldName: string, value: AppSelectOption | undefined, required: boolean, type: string, index: number): void {
        const options = this.makeConditionOperationOptions(fieldName);
        const f: AppField = {
            hint: 'operator',
            name: this.getFieldName(type, index, SubscriptionFields.ConditionOperatorSuffix),
            type: AppFieldTypes.STATIC_SELECT,
            options,
            refresh: true,
            is_required: required,
        };
        if (value) {
            f.value = value;
        }
        this.builder.addFieldToArray(f);
    }

    addConditionValueField(field: string, value: string, required: boolean, type: string, index: number) {
        const condition = this.fetchedConditionOptions.find((c: ZDConditionOption) => {
            return c.subject.toString() === field;
        });

        const f: AppField = {
            type: AppFieldTypes.TEXT,
            hint: 'value',
            name: this.getFieldName(type, index, SubscriptionFields.ConditionValueSuffix),
            is_required: required,
        };

        if (value) {
            f.value = value;
        }

        // if the condition has values, it is a select field
        if (condition?.values) {
            f.type = AppFieldTypes.STATIC_SELECT;
            f.options = this.makeConditionValueOptions(condition);
            f.value = this.getConditionOptionValueValue(f.options, value);
        }

        this.builder.addField(f);
    }

    // getConditions returns an array of Zendesk ANY or ALL trigger conditions for
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

    addConditionsFieldsHeader(type: string): void {
        const md = [
            `#### Meet \`${type.toUpperCase()}\` of the following conditions`,
            '---',
        ].join('\n');

        const f: AppField = {
            name: 'anyFields',
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

    getSubNameValue(): string {
        const selectedDropDownName = this.getSelectedSubTriggerName();
        const newSub = this.isNewSub();
        const selected = this.call.selected_field === SubscriptionFields.SubSelectName;
        if (selected) {
            if (!newSub) {
                return selectedDropDownName;
            }
        } else if (newSub) {
            if (this.call.values) {
                const subTextCallValue = this.call.values[SubscriptionFields.SubTextName];
                return subTextCallValue;
            }
        } else {
            return selectedDropDownName;
        }
        return '';
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
            label: SubscriptionFields.SubSelectLabel,
            type: AppFieldTypes.STATIC_SELECT,
            options,
            is_required: true,
            refresh: true,
        };

        this.builder.addField(f);
    }

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
        const trigger = this.triggers.find((t: ZDTrigger) => t.id.toString() === subID) as ZDTrigger;
        if (!trigger && !this.isNewSub()) {
            throw new Error('unable to get trigger by ID ' + subID);
        }

        return trigger;
    }

    getOptionValue(option: ZDTriggerCondition): AppSelectOption | undefined {
        const fieldOptions = this.makeConditionFieldNameOptions();
        const field = option.field;
        const value = fieldOptions.find((f: AppSelectOption) => {
            return f.value.toString() === field;
        });
        return value;
    }

    getConditionOptionValueValue(fieldOptions: AppSelectOption[], option: string): AppSelectOption | undefined {
        const value = fieldOptions.find((f: AppSelectOption) => {
            return f.value.toString() === option;
        });
        return value;
    }

    makeConditionFieldNameOptions(): AppSelectOption[] {
        const makeOption = (option: ZDConditionOption): AppSelectOption => ({label: option.title, value: option.subject});
        const makeOptions = (options: ZDConditionOption[]): AppSelectOption[] => options.map(makeOption);

        const fields = makeOptions(this.fetchedConditionOptions);
        return fields;
    }

    makeConditionOperationOptions(field: string): AppSelectOption[] {
        const makeOption = (option: ZDConditionOptionOperator): AppSelectOption => ({label: option.title, value: option.value});
        const makeOptions = (options: ZDConditionOptionOperator[]): AppSelectOption[] => options.map(makeOption);

        const condition = this.getConditionFromConditionsOptions(field);
        const operators = condition.operators;
        const fields = makeOptions(operators);
        return fields;
    }

    getConditionFromConditionsOptions(subject: string): ZDConditionOption {
        const condition = this.fetchedConditionOptions.find((c: ZDConditionOption) => {
            return c.subject.toString() === subject;
        });
        return condition as ZDConditionOption;
    }

    makeConditionValueOptions(condition: ZDConditionOption): AppSelectOption[] {
        const makeOption = (option: ZDConditionOptionValue): AppSelectOption => ({label: option.title, value: option.value});
        const makeOptions = (options: ZDConditionOptionValue[]): AppSelectOption[] => options.map(makeOption);

        if (condition.values) {
            const fields = makeOptions(condition.values);
            return fields;
        }
        return [];
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
