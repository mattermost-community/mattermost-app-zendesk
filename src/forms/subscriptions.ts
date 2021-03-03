import {Channel} from 'mattermost-redux/types/channels';
import {AppSelectOption, AppCall, AppForm, AppField} from 'mattermost-redux/types/apps';
import {AppFieldTypes} from 'mattermost-redux/constants/apps';

import Client4 from 'mattermost-redux/client/client4.js';

import {newZDClient, newMMClient, ZDClient} from '../clients';
import {Routes, ZDIcon} from '../utils';
import {makeSubscriptionOptions, makeChannelOptions, getChannelIDFromTriggerTitle, tryPromiseWithMessage} from '../utils/utils';
import {SubscriptionFields} from '../utils/constants';

import {BaseFormFields} from '../utils/base_form_fields';

// newSubscriptionsForm returns a form response to create subscriptions
export async function newSubscriptionsForm(call: AppCall): Promise<AppForm> {
    const zdClient = newZDClient(call.context);
    const mmClient = newMMClient().asAdmin();
    const formFields = new FormFields(call, zdClient, mmClient);
    const fields = await formFields.getSubscriptionFields();

    const form: AppForm = {
        title: 'Create or Edit Zendesk Subscriptions',
        header: 'Create or edit channel subscriptions to Zendesk notifications',
        icon: ZDIcon,
        submit_buttons: SubscriptionFields.SubmitButtonsName,
        fields,
        call: {
            url: Routes.App.CallPathSubmitOrUpdateSubcriptionForm,
        },
    };
    return form;
}

// FormFields retrieves viewable modal app fields
class FormFields extends BaseFormFields {
    teamTriggers: any
    teamChannelsWithSubs: Channel[]

    unsupportedFields: string[]
    unsupportedOperators: string[]

    constructor(call: AppCall, zdClient: ZDClient, mmClient: Client4) {
        super(call, zdClient, mmClient);
        this.teamTriggers = {};
        this.teamChannelsWithSubs = [];
        this.unsupportedFields = [];
        this.unsupportedOperators = [];
    }

    async getSubscriptionFields(): Promise<AppField[]> {
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
        const searchReq = this.zdClient.triggers.search(SubscriptionFields.PrefixTriggersTitle);
        const triggers = await tryPromiseWithMessage(searchReq, 'Failed to fetch triggers');
        for (const trigger of triggers) {
            await this.addChannelTrigger(trigger);
        }
    }

    async addChannelTrigger(trigger: any): Promise<void> {
        const channelID = getChannelIDFromTriggerTitle(trigger.title);
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
        if (this.getTeamChannelsWithSubs().length <= 1) {
            return;
        }

        const options = makeChannelOptions(this.getTeamChannelsWithSubs());
        const currentChannelOption = options.filter(this.getDefaultChannelOption());

        const f: AppField = {
            name: SubscriptionFields.ChannelPickerSelect_Name,
            type: AppFieldTypes.STATIC_SELECT,
            label: SubscriptionFields.ChannelPickerSelect_Label,
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
        // TODO add other fields besides checkboxes
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

    // addSubCheckBoxes adds the available check box options for subscription
    addSubCheckBoxes(): void {
        const checkboxes = [];
        for (const fieldName of SubscriptionFields.ConditionsCheckBoxFields) {
            const f: AppField = {
                name: fieldName,
                type: AppFieldTypes.BOOL,
                label: fieldName,
                value: false,
            };

            if (this.isNewSub()) {
                checkboxes.push(f);
                continue;
            }

            // add checkbox field and set the value
            if (this.getSelectedSubTrigger() && this.getSelectedSubTrigger().conditions) {
                const anyConditions = this.getAnyConditions();
                if (this.isZdFieldChecked(anyConditions, fieldName)) {
                    f.value = true;
                }
            }
            checkboxes.push(f);
        }
        this.builder.addFields(checkboxes);
    }

    // validateFields validates fields base on conditions supported by the app
    validateConditions(): boolean {
        // fields are valid for new subscriptions because
        if (this.isNewSub()) {
            return true;
        }

        const anyConditions = this.getAnyConditions();
        const allConditions = this.getAllConditions();
        for (const conditions of [anyConditions, allConditions]) {
            for (const condition of conditions) {
                this.validateFieldName(condition);
                this.validateFieldOperator(condition);
            }
        }

        // add validation error message field to the modal
        if (this.unsupportedFields.length !== 0 || this.unsupportedOperators.length !== 0) {
            this.addErrorMessageField(this.getSelectedSubTrigger().url);
            return false;
        }
        return true;
    }

    // validateFieldName validates the trigger name is supported by the app
    validateFieldName(condition: any): void {
        if (!SubscriptionFields.ConditionsCheckBoxFields.includes(condition.field)) {
            this.unsupportedFields.push(condition.field);
        }
    }

    // validateFieldOperator validates the trigger operator is supported by the app
    validateFieldOperator(condition: any): void {
        if (condition.operator !== 'changed') {
            this.unsupportedOperators.push(`${condition.field} - ${condition.operator}`);
        }
    }

    // getAnyConditions returns an array of Zendesk ANY trigger conditions
    getAnyConditions(): any[] {
        if (this.getSelectedSubTrigger() && this.getSelectedSubTrigger().conditions) {
            return this.getSelectedSubTrigger().conditions.any;
        }
        return [];
    }

    // getAnyConditions returns an array of Zendesk ALL trigger conditions
    getAllConditions(): any[] {
        if (this.getSelectedSubTrigger() && this.getSelectedSubTrigger().conditions) {
            return this.getSelectedSubTrigger().conditions.all;
        }
        return [];
    }

    // addErrorMessageField adds a text field with a message when a trigger has
    // conditions not supported by the app
    addErrorMessageField(link: string): void {
        let text = 'The following condition fields are not currently supported by the app. Please visit the trigger link to modify the conditions for this subscription';
        text += '\n\n';
        text += this.getBulletedList('Unsupported Fields', this.unsupportedFields);
        text += '\n\n';
        text += this.getBulletedList('Unsupported Field Operators', this.unsupportedOperators);
        text += '\n\n' + link;

        // TODO This message is better suited as an error message next to buttons
        // Need to add clickable link to trigger.  Always show the link (next to Subscription Name)
        // disble the submit button';
        const f: AppField = {
            name: SubscriptionFields.UnsupportedFieldsText_Name,
            type: AppFieldTypes.TEXT,
            subtype: 'textarea',
            label: 'Optional message',
            value: text,
            readonly: true,
        };

        this.builder.addField(f);
    }

    // getBulletedList returns a bulleted list of items with options header
    // pretext
    getBulletedList(pretext: string, items: string[]): string {
        let text = '* ' + items.join('\n* ');
        if (pretext) {
            text = `###  ${pretext}\n` + text;
        }
        return text;
    }

    // isZdFieldChecked returns a boolean representing if a value in the saved
    // Zendesk trigger is true or false
    isZdFieldChecked(conditions: any, name: string): boolean {
        const condition = conditions.filter(this.byName(name));
        return condition.length === 1;
    }

    // byName is a map filter function to retrieve a given fieldName from an
    // array of conditions
    byName(name: string): boolean {
        return (option: any): boolean => {
            return option.field === name;
        };
    }

    // addNewSubTextField adds a field for adding or editing a subcription name
    addSubNameTextField(): void {
        const f: AppField = {
            name: SubscriptionFields.SubText_Name,
            type: AppFieldTypes.TEXT,
            label: SubscriptionFields.SubText_Label,
            is_required: true,
        };

        if (this.isNewSub()) {
            f.hint = this.getSelectedSubTriggerName();

            // TODO this value needs to be set to empty so the hint will show.
            // setting to '' does not work
            // not setting keeps previous text form previous selected sub
            f.value = this.getSelectedSubTriggerName();
        } else {
            f.value = this.getSelectedSubTriggerName();
        }

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
            name: SubscriptionFields.SubSelect_Name,
            label: SubscriptionFields.SubSelect_Label,
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

    // getSubsForSelectedChannel returns an array of channels for th currently
    // selected channel
    getSubsForSelectedChannel(): Channel[] {
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
        return this.builder.getFieldValueByName(SubscriptionFields.ChannelPickerSelect_Name);
    }

    getSelectedSubTrigger(): string {
        const subID = this.getSelectedSubTriggerID();
        return this.getSubTriggerByID(subID);
    }

    getSelectedSubTriggerID(): string {
        return this.builder.getFieldValueByName(SubscriptionFields.SubSelect_Name);
    }

    getSelectedSubTriggerName(): string {
        return this.builder.getFieldLabelByName(SubscriptionFields.SubSelect_Name);
    }

    getSubTriggerByID(subID: string): any {
        const triggers = this.getChannelTriggers(this.getSelectedChannelID());
        for (const trigger of triggers) {
            if (String(trigger.id) === subID) {
                return trigger;
            }
        }
    }

    getChannelTriggers(channelID: string): any[] {
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
}
