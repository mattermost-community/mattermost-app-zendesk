import {AppCallRequest, AppForm, AppField} from 'mattermost-redux/types/apps';

import {AppFieldTypes} from 'mattermost-redux/constants/apps';
import Client4 from 'mattermost-redux/client/client4.js';

import {CtxExpandedBotAdminActingUserOauth2User} from '../types/apps';
import {newZDClient, newMMClient, ZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';
import {Routes} from '../utils';
import {makeSubscriptionOptions, tryPromiseWithMessage} from '../utils/utils';
import {ZDTrigger, ZDTriggerConditions, ZDConditionOption, ZDConditionOptionOperator} from '../utils/ZDTypes';
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
    conditionsOptionsAll: ZDTriggerConditions
    conditionsOptionsAny: ZDTriggerConditions

    constructor(call: AppCallRequest, zdClient: ZDClient, mmClient: Client4, zdHost: string) {
        super(call, mmClient, zdClient);
        console.log('\n\n\n<><><><><>. IN HERE!');
        console.log('call.values', call.values);
        console.log('call.selected_field', this.call.selected_field);

        this.triggers = {};
        this.zdHost = zdHost;
        this.conditionsOptionsAll = {};
        this.conditionsOptionsAny = {};
        this.selectedSavedTriggerConditions = {};
    }

    async addSubscriptionFields(): Promise<AppField[]> {
        await this.fetchZDConditions();
        this.triggers = await this.fetchChannelTriggers();
        this.addSubSelectField();

        // only show subscriptions name field until user selects a value
        if (!this.builder.currentFieldValuesAreDefined()) {
            return this.builder.getFields();
        }

        this.selectedSavedTriggerConditions = this.getSavedZDConditions() || {};

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
        this.conditionsOptionsAll = definitions[0].definitions.conditions_all;
        this.conditionsOptionsAny = definitions[0].definitions.conditions_any;
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
                this.selectedSavedTriggerConditions[type].forEach((condition, i) => {
                    const fieldNameOptions = this.makeConditionFieldOptions();
                    const fieldNameValue = this.getOptionValue(fieldNameOptions, condition);
                    const condFieldName = type + '_' + i + '_' + SubscriptionFields.NewConditionFieldOptionValue;
                    const operatorFieldName = type + '_' + i + '_' + SubscriptionFields.NewConditionOperatorOptionValue;
                    this.addConditionNameField(condFieldName, fieldNameValue, type, i);

                    const savedOperValue = condition.operator;
                    const operatorFieldOptions = this.makeConditionOperationOptions(condition.field);
                    const savedFieldOption = operatorFieldOptions.find((option: any) => {
                        return option.value.toString() === savedOperValue;
                    });
                    this.addConditionOperatorField(operatorFieldName, operatorFieldOptions, savedFieldOption);
                });
            } else {
                // use the new call values
                const callValueConditions = this.getConditionFieldsFromCallValues();
                let condField = '';
                for (const callVal of callValueConditions) {
                    const index = callVal[0].split('_')[1];
                    if (callVal[0].endsWith('_field')) {
                        condField = callVal[1].value;
                        this.addConditionNameField(callVal[0], callVal[1], type, index);
                    }
                    if (callVal[0].endsWith('_operator')) {
                        const operatorFieldName = callVal[0];
                        const operatorFieldOptions = this.makeConditionOperationOptions(condField);
                        const savedFieldOption = callVal[1];
                        this.addConditionOperatorField(operatorFieldName, operatorFieldOptions, savedFieldOption);

                        const condOption = this.getConditionFromConditionsOptions('status');
                        const condOptionOperators: ZDConditionOptionOperator[] = condOption.operators;
                        const operator = condOptionOperators.find((option: ZDConditionOptionOperator) => {
                            return option.value.toString() === savedFieldOption.value;
                        });
                        console.log('operator', operator);
                        const isTerminal = operator.terminal;

                        if (!isTerminal) {
                            this.addConditionValueField(condField);
                        }
                        console.log('isTerminal', isTerminal);
                    }
                }
            }
        }
    }

    // getConditionFieldsFromCallValues returns an array of key/value pairs for
    // call values that begin with 'any_' or 'all_'
    getConditionFieldsFromCallValues() {
        const callValueConditions = Object.entries(this.call.values).
            filter((entry) => {
                return entry[0].startsWith('any_') || entry[0].startsWith('all_');
            });
        return callValueConditions;
    }

    addConditionNameField(condFieldName:string, fieldNameValue: any, type: string, index: number): void {
        const fieldNameOptions = this.makeConditionFieldOptions();
        const field: AppField = {
            hint: 'field',
            name: condFieldName,
            type: AppFieldTypes.STATIC_SELECT,
            options: fieldNameOptions,
            label: `${index}. ${type.toUpperCase()} Condition`,
            refresh: true,
            value: fieldNameValue,
        };
        this.builder.addField(field);
    }

    addConditionOperatorField(name: string, options: any, value: any): void {
        const f: AppField = {
            hint: 'operator',
            name,
            type: AppFieldTypes.STATIC_SELECT,
            options,
            refresh: true,
            value,
        };
        this.builder.addField(f);
    }

    addConditionValueField(field: string) {
        const options = this.makeConditionValueOptions(field);
        const f: AppField = {
            hint: 'value',
            name: SubscriptionFields.NewConditionValueOptionValue,
            type: AppFieldTypes.STATIC_SELECT,
            options,
        };
        this.builder.addField(f);
    }

    // getConditions returns an array of Zendesk ANY or ALL trigger conditions for
    // the selected subscription
    getSavedZDConditions(): ZDTriggerConditions | undefined {
        if (this.getSelectedSubTrigger() && this.getSelectedSubTrigger().conditions) {
            return this.getSelectedSubTrigger().conditions;
        }
        return [] as ZDTriggerConditions;
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
        const trigger = this.triggers.find((t) => t.id.toString() === subID) as ZDTrigger;
        if (!trigger && !this.isNewSub()) {
            throw new Error('unable to get trigger by ID ' + subID);
        }

        return trigger;
    }

    getOptionValue(fieldOptions, option): any {
        const field = option.field;
        const value = fieldOptions.find((f: any) => {
            return f.value.toString() === field;
        });
        return value;
    }

    makeConditionFieldOptions(): any {
        const makeOption = (option: any): any => ({label: option.title, value: option.subject});
        const makeOptions = (options: any[]): any[] => options.map(makeOption);

        const c = subscriptionOptions.conditions;
        const fields = makeOptions(c);
        return fields;
    }

    makeConditionOperationOptions(field: string): any {
        const condition = this.getConditionFromConditionsOptions(field);
        const makeOption = (option: any): any => ({label: option.title, value: option.value});
        const makeOptions = (options: any[]): any[] => options.map(makeOption);

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

    makeConditionValueOptions(field: string): any {
        const condition = subscriptionOptions.conditions.find((c: any) => {
            return c.subject.toString() === field;
        });
        const makeOption = (option: any): any => ({label: option.title, value: option.subject});
        const makeOptions = (options: any[]): any[] => options.map(makeOption);

        const values = condition.values;
        const fields = makeOptions(values);
        return fields;
    }

    // fetchChannelTriggers gets all the channel triggers saved in Zendesk via the ZD client
    async fetchChannelTriggers(): Promise<any> {
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
