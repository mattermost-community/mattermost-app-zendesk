import asyncBatch from 'async-batch/lib';

import {Channel} from 'mattermost-redux/types/channels';
import {AppSelectOption, AppCallRequest, AppForm, AppField} from 'mattermost-redux/types/apps';

import {AppFieldTypes} from 'mattermost-redux/constants/apps';
import Client4 from 'mattermost-redux/client/client4.js';

import {CtxExpandedBotAdminActingUserOauth2User, ExpandedChannel} from '../types/apps';
import {newZDClient, newMMClient, ZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';
import {getStaticURL, Routes} from '../utils';
import {makeBulletedList, makeSubscriptionOptions, makeChannelOptions, parseTriggerTitle,
    checkBox, getCheckBoxesFromTriggerDefinition, tryPromiseWithMessage} from '../utils/utils';
import {ZDTrigger, ZDTriggerCondition, ZDTriggerConditions} from '../utils/ZDTypes';
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
    const formFields = new FormFields(call, zdClient, mmClient, zdHost);
    const fields = await formFields.getSubscriptionFields();

    const form: AppForm = {
        title: 'Create or Edit Zendesk Subscriptions',
        header: 'Create or edit channel subscriptions to Zendesk notifications',
        icon: getStaticURL(call.context.mattermost_site_url, ZendeskIcon),
        submit_buttons: SubscriptionFields.SubmitButtonsName,
        fields,
        call: {
            path: Routes.App.CallPathSubsSubmitOrUpdateForm,
        },
    };
    return form;
}

type ZDTriggers = Record<string, ZDTrigger[]>

// FormFields retrieves viewable modal app fields. The fields are scoped to the currently viewed team
class FormFields extends BaseFormFields {
    triggers: ZDTriggers
    channelsWithSubs: Channel[]

    zdHost: string
    conditions: any
    checkboxes: checkBox[]
    unsupportedFields: string[]
    unsupportedOperators: string[]

    constructor(call: AppCallRequest, zdClient: ZDClient, mmClient: Client4, zdHost: string) {
        super(call, mmClient, zdClient);
        this.triggers = {};
        this.channelsWithSubs = [];
        this.zdHost = zdHost;
        this.conditions = [];
        this.checkboxes = [];
        this.unsupportedFields = [];
        this.unsupportedOperators = [];
    }

    async getSubscriptionFields(): Promise<AppField[]> {
        await this.buildConditions();
        await this.setState();
        await this.buildFields();
        return this.builder.getFields();
    }

    // buildFields adds fields to list of viewable proxy app fields
    async buildFields(): Promise<void> {
        this.addSubSelectField();

        // only show subscriptions name field until user selects a value
        if (!this.builder.currentFieldValuesAreDefined()) {
            return;
        }

        // if fields aren't valid return before adding fields
        if (!this.validateConditions()) {
            return;
        }

        // add fields that are dependant on the subscription name
        this.addSubNameDependentFields();
    }

    // setState sets state for triggers and channelsWithSubs
    async setState(): Promise<void> {
        const triggers = await this.getTriggers();
        await this.buildChannelsWithSubs(triggers);
        this.addChannelTrigger(triggers);
    }

    // getTriggers gets all the team triggers saved in Zendesk via the ZD client
    async getTriggers(): Promise<any> {
        // modified node-zendesk to allow hitting triggers/search api
        // returns all triggers for all channels and teams
        let search = SubscriptionFields.PrefixTriggersTitle;
        search += SubscriptionFields.RegexTriggerInstance;
        search += this.call.context.mattermost_site_url;
        search += SubscriptionFields.RegexTriggerTeamID;
        search += this.call.context.team_id;
        search += SubscriptionFields.RegexTriggerChannelID;
        search += this.call.context.channel_id;
        const client = this.zdClient as ZDClient;
        const searchReq = client.triggers.search(search) || '';
        return tryPromiseWithMessage(searchReq, 'Failed to fetch triggers');
    }

    // buildChannelsWithSubs builds an array of channels that contain subscription
    async buildChannelsWithSubs(triggers: ZDTrigger[]): Promise<void> {
        // prefetch the channels and build unique array of channelIDs
        const channelIDs: string[] = [];
        for (const trigger of triggers) {
            const parsedTitle = parseTriggerTitle(trigger.title);
            const channelID = parsedTitle.channelID;
            if (channelIDs.includes(channelID)) {
                continue;
            }
            channelIDs.push(channelID);
        }

        const parallelJobs = 10;
        const asyncMethod = async (channelID: string) => {
            const channel = await this.mmClient.getChannel(channelID);
            this.channelsWithSubs.push(channel);
        };
        await asyncBatch(channelIDs, asyncMethod, parallelJobs);
    }

    // addChannelTrigger adds the team triggers
    // triggers - object with keys of channel IDs and values of
    //                array of triggers for the current team
    addChannelTrigger(triggers: ZDTrigger[]): void {
        for (const trigger of triggers) {
            const parsedTitle = parseTriggerTitle(trigger.title);
            const channelID = parsedTitle.channelID;
            if (!this.triggers[channelID]) {
                this.triggers[channelID] = [];
            }
            this.triggers[channelID].push(trigger);
        }
    }

    // addSubNameDependentFields add the conditional fields once the
    // subscription picker is selected
    addSubNameDependentFields(): void {
        // provide a text field to add the name of the new subscription
        this.addSubNameTextField();
        this.addSubCheckBoxes();
        this.addSubmitButtons();
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

    async buildConditions(): Promise<void> {
        const client = this.zdClient as ZDClient;
        const req = client.triggers.definitions() || '';
        const definitions = await tryPromiseWithMessage(req, 'Failed to fetch trigger definitions');
        const checkboxes = getCheckBoxesFromTriggerDefinition(definitions);
        this.checkboxes = checkboxes;
    }

    // addSubCheckBoxes adds the available check box options for subscription
    addSubCheckBoxes(): void {
        const checkboxes: AppField[] = [];
        for (const box of this.checkboxes) {
            const f: AppField = {
                name: box.name,
                type: AppFieldTypes.BOOL,
                label: box.label,
                value: false,
            };

            if (this.isNewSub()) {
                checkboxes.push(f);
                continue;
            }

            // add checkbox field and set the value
            if (this.getConditions()) {
                const anyConditions = this.getConditions()?.any;
                if (anyConditions && this.isZdFieldChecked(anyConditions, box.name)) {
                    f.value = true;
                }
            }
            checkboxes.push(f);
        }
        this.builder.addFields(checkboxes);
    }

    // validateFields validates fields bases on conditions supported by the app
    validateConditions(): boolean {
        // fields are valid for new subscriptions because
        if (this.isNewSub()) {
            return true;
        }

        const conditions = this.getConditions();
        if (!conditions) {
            return true;
        }

        for (const cType of ['any', 'all']) {
            for (const condition of conditions[cType]) {
                this.validateFieldName(condition);
                this.validateFieldOperator(condition);
            }
        }

        // add validation error message field to the modal
        if (this.unsupportedFields.length !== 0 || this.unsupportedOperators.length !== 0) {
            const host = this.zdHost;
            const trigger = this.getSelectedSubTrigger();
            const url = `${host}/agent/admin/triggers/${trigger.id}`;
            this.addErrorMessageField(url);
            return false;
        }
        return true;
    }

    // validateFieldName validates the trigger name is supported by the app
    validateFieldName(condition: ZDTriggerCondition): void {
        const found = this.checkboxes.find((box) => box.name === condition.field);
        if (!found) {
            this.unsupportedFields.push(condition.field);
        }
    }

    // validateFieldOperator validates the trigger operator is supported by the app
    validateFieldOperator(condition: ZDTriggerCondition): void {
        if (condition.operator !== 'changed') {
            this.unsupportedOperators.push(`${condition.field} - ${condition.operator}`);
        }
    }

    // getAnyConditions returns an array of Zendesk ANY trigger conditions
    getConditions(): ZDTriggerConditions | undefined {
        if (this.getSelectedSubTrigger() && this.getSelectedSubTrigger().conditions) {
            return this.getSelectedSubTrigger().conditions;
        }
        return undefined;
    }

    // addErrorMessageField adds a text field with a message when a trigger has
    // conditions not supported by the app
    addErrorMessageField(link: string): void {
        let text = 'The following condition fields are not currently supported by the app. Please visit the trigger link to modify the conditions for this subscription';
        text += '\n\n';
        text += makeBulletedList('Unsupported Fields', this.unsupportedFields);
        text += '\n\n';
        text += makeBulletedList('Unsupported Field Operators', this.unsupportedOperators);
        text += '\n\n' + link;

        const f: AppField = {
            name: SubscriptionFields.UnsupportedFieldsTextName,
            type: AppFieldTypes.TEXT,
            subtype: 'textarea',
            label: 'Optional message',
            value: text,
            readonly: true,
        };

        this.builder.addField(f);
    }

    // isZdFieldChecked returns a boolean representing if a value in the saved
    // Zendesk trigger is true or false
    isZdFieldChecked(conditions: ZDTriggerCondition[], name: string): boolean {
        const condition = conditions.filter(this.byName(name));
        return condition.length === 1;
    }

    // byName is a map filter function to retrieve a given fieldName from an
    // array of conditions
    byName(name: string): (option: ZDTriggerCondition) => boolean {
        return (option: ZDTriggerCondition): boolean => {
            return option.field === name;
        };
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
        const channelSubs = this.getSubsForSelectedChannel();

        // first option is to create new subscription
        const newSubOption = {
            label: SubscriptionFields.NewSub_OptionLabel,
            value: SubscriptionFields.NewSub_OptionValue,
        };
        const subsOptions = makeSubscriptionOptions(channelSubs);
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

    // getChannelsWithSubs returns an array of channels that have
    // subscriptions scoped to the currently viewed team
    getChannelsWithSubs(): Channel[] {
        return this.channelsWithSubs;
    }

    // getSubsForSelectedChannel returns an array of channels for the currently
    // selected channel
    getSubsForSelectedChannel(): ZDTrigger[] {
        // if value is not null, the user selected a value in the channel picker
        let id = this.getSelectedChannelID();
        if (id === '') {
            // by default, look for subscriptions in the current channel
            id = this.getCurrentChannelID();
        }
        if (this.triggers[id]) {
            return this.triggers[id];
        }
        return [];
    }

    isNewSub(): boolean {
        return this.getSelectedSubTriggerID() === SubscriptionFields.NewSub_OptionValue;
    }

    getSelectedChannelID(): string {
        return this.builder.getFieldValueByName(SubscriptionFields.ChannelPickerSelectName) as string;
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
        const triggers: ZDTrigger[] = this.getChannelTriggers(this.call.context.channel_id);
        const trigger = triggers.find((t) => t.id.toString() === subID) as ZDTrigger;
        if (!trigger) {
            throw new Error('unable to get trigger by ID ' + subID);
        }

        return trigger;
    }

    getChannelTriggers(channelID: string): ZDTrigger[] {
        if (this.triggers[channelID]) {
            return this.triggers[channelID];
        }
        return [];
    }

    getDefaultChannelOption() {
        return (option: AppSelectOption): boolean => {
            return option.value === this.getCurrentChannelID();
        };
    }
}
