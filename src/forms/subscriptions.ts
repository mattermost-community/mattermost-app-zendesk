import asyncBatch from 'async-batch/lib';

import {AppCallRequest, AppForm, AppField} from 'mattermost-redux/types/apps';

import {AppFieldTypes} from 'mattermost-redux/constants/apps';
import Client4 from 'mattermost-redux/client/client4.js';

import {CtxExpandedBotAdminActingUserOauth2User} from '../types/apps';
import {newZDClient, newMMClient, ZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';
import {Routes} from '../utils';
import {makeSubscriptionOptions, tryPromiseWithMessage} from '../utils/utils';
import {ZDTrigger, ZDTriggerConditions} from '../utils/ZDTypes';
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
    conditionsOptionsAll: ZDTriggerConditions
    conditionsOptionsAny: ZDTriggerConditions

    constructor(call: AppCallRequest, zdClient: ZDClient, mmClient: Client4, zdHost: string) {
        super(call, mmClient, zdClient);
        console.log('call.values', call.values);
        this.triggers = {};
        this.zdHost = zdHost;
        this.conditionsOptionsAll = {};
        this.conditionsOptionsAny = {};
    }

    async addSubscriptionFields(): Promise<AppField[]> {
        await this.fetchZDConditions();
        this.triggers = await this.fetchChannelTriggers();
        this.addSubSelectField();

        // only show subscriptions name field until user selects a value
        if (!this.builder.currentFieldValuesAreDefined()) {
            return this.builder.getFields();
        }

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
    addConditionsFields(): void {
        const types: string[] = ['any', 'all'];
        for (const type of types) {
            this.addConditionsFieldsHeader(type);
            const savedZdConditions = this.getConditions(type);

            // iterate through the conditions saved in Zendesk
            savedZdConditions.forEach((condition, i) => {
                this.addCondition(type, i, condition);
            });

            // add an empty field so user can add a new field
            this.addCondition(type, savedZdConditions.length, null);
        }
    }

    // addCondition adds a new condition which consists of
    // - field name
    // - condition operator
    // - value (optional if operator is terminal)
    addCondition(type: string, index: number, savedZdCondition: any): void {
        const fieldOptions = this.makeConditionFieldOptions();

        const upperType = type.toUpperCase();
        const label = `${index}. ${upperType} Condition`;
        const field: AppField = {
            hint: 'field',
            name: type + '_' + index + '_' + SubscriptionFields.NewConditionFieldOptionValue,
            type: AppFieldTypes.STATIC_SELECT,
            options: fieldOptions,
            label,
            refresh: true,
        };

        if (savedZdCondition) {
            field.value = this.getOptionValue(fieldOptions, savedZdCondition);
        }

        this.builder.addField(field);

        if (savedZdCondition) {
            const isTerminal = this.addConditionOperatorField(type, savedZdCondition, index);
            if (!isTerminal) {
                this.addConditionValueField(savedZdCondition.field);
            }
        }
    }

    // getConditions returns an array of Zendesk ANY or ALL trigger conditions for
    // the selected subscription
    getConditions(type: string): ZDTriggerConditions | undefined {
        if (this.getSelectedSubTrigger() && this.getSelectedSubTrigger().conditions) {
            const cond = this.getSelectedSubTrigger().conditions;
            return cond[type];
        }
        return undefined;
    }

    addConditionOperatorField(type: string, savedZdCondition: any, index: number): boolean {
        const savedOperValue = savedZdCondition.operator;
        const options = this.makeConditionOperationOptions(savedZdCondition.field);
        const savedFieldOption = options.find((option: any) => {
            return option.value.toString() === savedOperValue;
        });

        const fieldName = type + '_' + index + '_' + SubscriptionFields.NewConditionOperatorOptionValue;
        const f: AppField = {
            hint: 'operator',
            name: fieldName,
            type: AppFieldTypes.STATIC_SELECT,
            options,
            refresh: true,
        };

        // if call value is set by the user, use it, else used saved Zd value
        f.value = this.call.values[fieldName] || savedFieldOption;

        this.builder.addField(f);

        // determine if operator is terminal
        const condOption = this.getConditionFromConditionsOptions(savedZdCondition.field);
        const condOptionOperators = condOption.operators;
        const operator = condOptionOperators.find((option: any) => {
            return option.value.toString() === f.value.value;
        });
        return operator.terminal;
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

    addConditionsFieldsHeader(type: string): void {
        const upperType = type.toUpperCase();
        const md = [
            `#### Meet \`${upperType}\` of the following conditions`,
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
        if (!trigger) {
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

    getConditionFromConditionsOptions(subject: string): any {
        const condition = subscriptionOptions.conditions.find((c: any) => {
            return c.subject.toString() === subject;
        });
        return condition;
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
