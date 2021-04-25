import {Channel} from 'mattermost-redux/types/channels';
import {AppSelectOption, AppCallRequest, AppForm, AppField} from 'mattermost-redux/types/apps';

import {AppFieldTypes} from 'mattermost-redux/constants/apps';
import Client4 from 'mattermost-redux/client/client4.js';

import {CtxExpandedBotAdminActingUserOauth2User, ExpandedChannel} from '../types/apps';
import {newZDClient, newMMClient, ZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';
import {getStaticURL, Routes} from '../utils';
import {makeBulletedList, makeSubscriptionOptions, makeChannelOptions,
    parseTriggerTitle,
    checkBox,
    getCheckBoxesFromTriggerDefinition,
    tryPromiseWithMessage} from '../utils/utils';
import {ZDTrigger, ZDTriggerCondition, ZDTriggerConditions} from '../utils/ZDTypes';
import {SubscriptionFields, ZendeskIcon} from '../utils/constants';
import {BaseFormFields} from '../utils/base_form_fields';
import {newConfigStore} from '../store';

// newSubscriptionsForm returns a form response to create subscriptions
export async function newSubscriptionsForm(call: AppCallRequest): Promise<AppForm> {
    const context = call.context as CtxExpandedBotAdminActingUserOauth2User;
    const zdOptions: ZDClientOptions = {
        oauth2UserAccessToken: context.oauth2.user.access_token,
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

type ZDTeamTriggers = Record<string, ZDTrigger[]>

// FormFields retrieves viewable modal app fields
class FormFields extends BaseFormFields {
    teamTriggers: ZDTeamTriggers
    teamChannelsWithSubs: Channel[]

    zdHost: string
    conditions: any
    checkboxes: checkBox[]
    unsupportedFields: string[]
    unsupportedOperators: string[]

    constructor(call: AppCallRequest, zdClient: ZDClient, mmClient: Client4, zdHost: string) {
        super(call, mmClient, zdClient);
        this.teamTriggers = {};
        this.teamChannelsWithSubs = [];
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
        this.addChannelPickerField();
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

    // setState sets state for teamTriggers and teamChannelsWithSubs
    //   * teamTriggers - object with keys of channel IDs and values of
    //                  array of triggers for the current team
    //   * teamChannelsWithSubs - array of channels with subscriptions
    async setState(): Promise<void> {
        // modified node-zendesk to allow hitting triggers/search api
        // returns all triggers for all channels and teams
        let search = SubscriptionFields.PrefixTriggersTitle;
        search += SubscriptionFields.RegexTriggerInstance;
        search += this.call.context.mattermost_site_url;
        search += SubscriptionFields.RegexTriggerTeamID;
        search += this.call.context.team_id;
        const client = this.zdClient as ZDClient;
        const searchReq = client.triggers.search(search) || '';
        const triggers = await tryPromiseWithMessage(searchReq, 'Failed to fetch triggers');
        const results: Promise<void>[] = [];
        for (const trigger of triggers) {
            results.push(this.addChannelTrigger(trigger));
        }
        await Promise.all(results);
    }

    async addChannelTrigger(trigger: ZDTrigger): Promise<void> {
        const parsedTitle = parseTriggerTitle(trigger.title);
        const channelID = parsedTitle.channelID;
        const channel = await this.mmClient.getChannel(channelID);
        if (channel.team_id === this.getCurrentTeamID()) {
            if (this.teamTriggers[channelID]) {
                this.teamTriggers[channelID].push(trigger);
            } else {
                this.teamTriggers[channelID] = [];
                this.teamTriggers[channelID].push(trigger);
                this.teamChannelsWithSubs.push(channel);
            }
        }
    }

    // addChannelPickerField adds a channel picker field when more than one
    // channel in the current team has a subscription
    addChannelPickerField(): void {
        const options = makeChannelOptions(this.getTeamChannelsWithSubs());
        const currentChannelOption = options.filter(this.getDefaultChannelOption());
        const context = this.call.context as ExpandedChannel;

        // channel does not have any subscriptions. add default channel as the
        // selected option
        if (currentChannelOption.length === 0) {
            const option: AppSelectOption = {
                label: context.channel.display_name,
                value: context.channel.id,
            };
            currentChannelOption.push(option);
        }
        const f: AppField = {
            name: SubscriptionFields.ChannelPickerSelectName,
            type: AppFieldTypes.STATIC_SELECT,
            label: SubscriptionFields.ChannelPickerSelectLabel,
            options,
            is_required: true,
            refresh: true,
        };

        // when initially opening the modal (call.values is undefined)
        // set default option to current channel if the user is in a
        // channel with subscriptions
        if (currentChannelOption.length === 1 && !this.getCallValues()) {
            f.value = currentChannelOption[0];
        }
        this.builder.addField(f);
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
    async addSubCheckBoxes(): Promise<void> {
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
        };

        if (this.isNewSub()) {
            f.hint = this.getSelectedSubTriggerName();
            f.value = this.getSelectedSubTriggerName();
        } else {
            f.value = this.getSelectedSubTriggerName();
        }
        f.max_length = this.getMaxTitleNameLength();
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

    // getTeamChannelsWithSubs returns an array of channels that have
    // subscriptions scoped to the currently viewed team
    getTeamChannelsWithSubs(): Channel[] {
        return this.teamChannelsWithSubs;
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
        if (this.teamTriggers[id]) {
            return this.teamTriggers[id];
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
        const triggers: ZDTrigger[] = this.getChannelTriggers(this.getSelectedChannelID());
        const trigger = triggers.find((t) => t.id.toString() === subID) as ZDTrigger;
        if (!trigger) {
            throw new Error('unable to trigger by ID ' + subID);
        }

        return trigger;
    }

    getChannelTriggers(channelID: string): ZDTrigger[] {
        if (this.teamTriggers[channelID]) {
            return this.teamTriggers[channelID];
        }
        return [];
    }

    getDefaultChannelOption() {
        return (option: AppSelectOption): boolean => {
            return option.value === this.getCurrentChannelID();
        };
    }

    getMaxTitleNameLength(): number {
        //    255   - max allowed in the trigger title field in Zendesk
        //  -  47   - length of all constants
        //  -  50   = assume max instance name (conservative estimate. The only unknown)
        //  -  52   = uuid (26 * 2)
        // ------
        //    106

        // length of all constants
        // const lenConstants = (SubscriptionFields.PrefixCustomDefinitionSubject +
        //   SubscriptionFields.PrefixTriggersTitle +
        //   SubscriptionFields.RegexTriggerTeamID +
        //   SubscriptionFields.RegexTriggerChannelID).length;

        // Can be calculated directly
        // const lenInstanceName = this.call.context.mattermost_site_url.length;

        // total uuids saved in title
        // const lenUUID = 26; // 26 length of uuid for channel and team ids
        // const lenTotalUUID = lenUUID * 2; // x2 for channel and team ids

        // call it 75 to add for any other possible error coming from the instance name length
        const maxLength = 75;
        return maxLength;
    }
}
