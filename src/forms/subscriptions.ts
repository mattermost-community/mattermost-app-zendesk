import {AppCallRequest, AppForm, AppField, AppSelectOption} from 'mattermost-redux/types/apps';

import {AppFieldTypes} from 'mattermost-redux/constants/apps';
import Client4 from 'mattermost-redux/client/client4.js';

import {CtxExpandedBotAdminActingUserOauth2User} from '../types/apps';
import {newZDClient, newMMClient, ZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';
import {Routes} from '../utils';
import {makeSubscriptionOptions, tryPromiseWithMessage, getConditionFieldsFromCallValues} from '../utils/utils';
import {ZDTrigger, ZDTriggerCondition, ZDTriggerConditions, ZDConditionOption, ZDConditionOptionOperator} from '../utils/ZDTypes';
import {SubscriptionFields, ZendeskIcon} from '../utils/constants';
import {BaseFormFields} from '../utils/base_form_fields';
import {newConfigStore} from '../store';

import subscriptionOptions from './subscription_options.json';

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
        },
    };
    return form;
}

type ZDTriggers = Record<string, ZDTrigger[]>

// FormFields retrieves viewable modal app fields. The fields are scoped to the currently viewed channel
class FormFields extends BaseFormFields {
    triggers: ZDTriggers
    zdHost: string
    selectedSavedTriggerConditions: ZDTriggerConditions

    constructor(call: AppCallRequest, zdClient: ZDClient, mmClient: Client4, zdHost: string) {
        super(call, mmClient, zdClient);

        this.triggers = {};
        this.zdHost = zdHost;
        this.selectedSavedTriggerConditions = {any: [], all: []};
        console.log('\n\n\n<><><><><>. IN HERE!');
        console.log('call.values', call.values);
        console.log('selected_field', this.call.selected_field);
    }

    async addSubscriptionFields(): Promise<AppField[]> {
        // await this.fetchZDConditions();
        this.triggers = await this.fetchChannelTriggers();
        this.addSubSelectField();

        // only show subscriptions name field until user selects a value
        if (!this.builder.currentFieldValuesAreDefined()) {
            return this.builder.getFields();
        }

        this.selectedSavedTriggerConditions = this.getSavedZDConditions();

        // add fields that are dependant on the subscription name
        // provide a text field to add the name of the new subscription
        this.addSubNameTextField();
        this.addConditionsFields();
        this.addSubmitButtons();
        return this.builder.getFields();
    }

    // fetchZDConditions fetches the conditions as defined by the zendesk instance
    async fetchZDConditions(): Promise<void> {
        const client = this.zdClient as ZDClient;
        const req = client.triggers.definitions() || '';
        const definitions = await tryPromiseWithMessage(req, 'Failed to fetch trigger definitions');

        // this.conditionsOptionsAll = definitions[0].definitions.conditions_all;
        // this.conditionsOptionsAny = definitions[0].definitions.conditions_any;
    }

    // addConditionFields adds condition fields for a subscription
    // - When subcription selection changes, defaults are reset
    //   - if has saved ZD trigger, set to those values
    addConditionsFields(): void {
        // const types: string[] = ['any', 'all'];

        const types: string[] = ['any'];
        for (const type of types) {
            this.addConditionsFieldsHeader(type);

            // iterate through the conditions saved in Zendesk
            if (this.call.selected_field === SubscriptionFields.SubSelectName) {
                const lastIndex = this.selectedSavedTriggerConditions[type].length;
                if (lastIndex) {
                    this.selectedSavedTriggerConditions[type].forEach((condition: ZDTriggerCondition, i: number) => {
                        console.log('condition', condition);
                        const fieldNameOptions = this.makeConditionFieldNameOptions();
                        const fieldNameValue = this.getOptionValue(fieldNameOptions, condition);
                        this.addConditionNameField(fieldNameValue, type, i);

                        const savedOperValue = condition.operator;
                        const operatorFieldOptions = this.makeConditionOperationOptions(condition.field);
                        const savedFieldOption = operatorFieldOptions.find((option: any) => {
                            return option.value.toString() === savedOperValue;
                        });
                        this.addConditionOperatorField(condition.field, savedFieldOption, type, i);
                        if (condition.value) {
                            // console.log('condition.value', condition.value);
                            this.addConditionValueField(condition.field, condition.value, type, i);
                        }
                    });
                }
                this.addConditionNameField(null, type, lastIndex);
            } else {
                // Using call values once the modal is loaded with a subscription
                const callValueConditions = getConditionFieldsFromCallValues(this.call.values, type);

                // console.log('callValueConditions', callValueConditions);
                Object.keys(callValueConditions).
                    sort().
                    forEach((index, i) => {
                        const callCondition = callValueConditions[index];
                        if (callCondition) {
                            const fieldNameValue = callCondition.field;
                            this.addConditionNameField(fieldNameValue, type, index);
                        }

                        if (callCondition.field) {
                            console.log('\ncallCondition', callCondition);
                            const currentField = type + '_' + index + '_field';

                            if (currentField === this.call.selected_field) {
                                console.log('currentField', currentField);
                                this.addConditionOperatorField(callCondition.field.value, null, type, index);
                            } else {
                                this.addConditionOperatorField(callCondition.field.value, callCondition.operator, type, index);
                                const condOption = this.getConditionFromConditionsOptions(callCondition.field.value);
                                const condOptionOperators: ZDConditionOptionOperator[] = condOption.operators;
                                const operator = condOptionOperators.find((option: ZDConditionOptionOperator) => {
                                    return option.value.toString() === callCondition.operator.value;
                                });

                                if (operator) {
                                    const isTerminal = operator.terminal;
                                    if (!isTerminal) {
                                        this.addConditionValueField(callCondition.field.value, callCondition.value, type, index);
                                    }
                                }
                            }
                        }
                    });
            }
        }
    }

    addConditionNameField(fieldNameValue: AppSelectOption, type: string, index: number): void {
        const condFieldName = this.getFieldFieldName(type, index);
        const fieldNameOptions = this.makeConditionFieldNameOptions();
        const f: AppField = {
            hint: 'field',
            name: condFieldName,
            type: AppFieldTypes.STATIC_SELECT,
            options: fieldNameOptions,
            label: `${index}. ${type.toUpperCase()} Condition`,
            refresh: true,
        };

        if (fieldNameValue) {
            f.value = fieldNameValue;
        }
        this.builder.addField(f);
    }
    getFieldFieldName(type: string, i: string): string {
        return type + '_' + i + '_' + SubscriptionFields.NewConditionFieldOptionValue;
    }

    addConditionOperatorField(fieldName: string, value: AppSelectOption, type: string, index: string): void {
        const options = this.makeConditionOperationOptions(fieldName);
        const name = this.getOperatorFieldName(type, index);
        const f: AppField = {
            hint: 'operator',
            name,
            type: AppFieldTypes.STATIC_SELECT,
            options,
            refresh: true,
        };

        if (value) {
            f.value = value;
        }

        console.log('f', f);
        this.builder.addFieldToArray(f);
    }

    getOperatorFieldName(type: string, i: string): string {
        return type + '_' + i + '_' + SubscriptionFields.NewConditionOperatorOptionValue;
    }

    addConditionValueField(field: string, value: any, type: string, index: string) {
        const name = this.getOperatorFieldValueName(type, index);
        const condition = subscriptionOptions.conditions.find((c: ZDConditionOption) => {
            return c.subject.toString() === field;
        });

        const f: AppField = {
            type: AppFieldTypes.TEXT,
            hint: 'value',
            name,
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
    getOperatorFieldValueName(type: string, i: string): string {
        return type + '_' + i + '_' + SubscriptionFields.NewConditionValueOptionValue;
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
        };

        // add a new field the array without addField method, which checks the
        // previously set value. This way allows adding a field without a value
        // and utilizes the hint
        if (this.isNewSub()) {
            f.hint = SubscriptionFields.NewSub_Hint;
            this.builder.addFieldToArray(f);
            return;
        }
        f.value = this.getSelectedSubTriggerName();
        this.builder.addField(f);
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
        return this.getSelectedSubTriggerID() === SubscriptionFields.NewSub_OptionValue;
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

    getOptionValue(fieldOptions: AppSelectOption[], option: ZDTriggerCondition): AppSelectOption {
        const field = option.field;
        const value = fieldOptions.find((f: AppSelectOption) => {
            return f.value.toString() === field;
        });
        return value;
    }

    getConditionOptionValueValue(fieldOptions: AppSelectOption[], option: string): AppSelectOption {
        const value = fieldOptions.find((f: AppSelectOption) => {
            return f.value.toString() === option;
        });
        return value;
    }

    makeConditionFieldNameOptions(): AppSelectOption[] {
        const makeOption = (option: ZDConditionOption): AppSelectOption => ({label: option.title, value: option.subject});
        const makeOptions = (options: ZDConditionOption[]): AppSelectOption[] => options.map(makeOption);

        const c = subscriptionOptions.conditions;
        const fields = makeOptions(c);
        return fields;
    }

    makeConditionOperationOptions(field: string): AppSelectOption[] {
        const condition = this.getConditionFromConditionsOptions(field);
        const makeOption = (option: ZDConditionOptionOperator): AppSelectOption => ({label: option.title, value: option.value});
        const makeOptions = (options: ZDConditionOptionOperator[]): AppSelectOption[] => options.map(makeOption);

        const operators = condition.operators;
        const fields = makeOptions(operators);
        return fields;
    }

    getConditionFromConditionsOptions(subject: string): ZDConditionOption {
        const condition = subscriptionOptions.conditions.find((c: ZDConditionOption) => {
            return c.subject.toString() === subject;
        });
        return condition as ZDConditionOption;
    }

    makeConditionValueOptions(condition: any): AppSelectOption[] {
        const makeOption = (option: ZDConditionOption): AppSelectOption => ({label: option.title, value: option.value});
        const makeOptions = (options: ZDConditionOption[]): AppSelectOption[] => options.map(makeOption);

        const values = condition.values;
        const fields = makeOptions(values);
        return fields;
    }

    // fetchChannelTriggers gets all the channel triggers saved in Zendesk via the ZD client
    async fetchChannelTriggers(): Promise<ZDTriggers> {
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
