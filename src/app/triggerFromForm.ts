import {Tickets} from 'node-zendesk';

import {AppContext, AppFormValues, AppCallValues, AppCallRequest} from 'mattermost-redux/types/apps';

import {ZDTrigger, ZDTriggerConditions, ZDTriggerCondition} from '../utils/ZDTypes';

import {SubscriptionFields, TriggerFields} from '../utils/constants';

interface TriggerFromFrom {
    getTrigger(): Tickets.CreatePayload;
}

export class TriggerFromFormImpl implements TriggerFromFrom {
    values: AppCallValues;
    context: AppContext;
    trigger: ZDTrigger

    constructor(call: AppCallRequest) {
        this.values = call.values as AppCallValues;
        this.context = call.context;
        this.trigger = {} as ZDTrigger;
    }

    getTrigger(): any {
        // If not a new trigger, add the trigger ID to the payload
        // This is a signal to update the trigger, not create a new one
        if (!this.isNewTrigger()) {
            const subID = this.values[SubscriptionFields.SubSelectName].value;
            this.addField('id', subID);
        }
        this.addTitle();
        this.addDescription();
        this.addActions();
        this.addConditions();

        return {trigger: this.trigger};
    }

    addActions(): void {
        const actions = [
            {
                field: TriggerFields.ActionField,
                value: [
                    TriggerFields.TargetID,
                    this.getJSONDataFields(),
                ],
            },
        ];
        this.addField('actions', actions);
    }

    // getJSONDataFields constructs the object text string for a trigger
    getJSONDataFields(): string {
        // default to the viewing channel_id
        let channelID = this.context.channel_id;

        // if channel picker exists, use its channel ID value
        if (this.values[SubscriptionFields.ChannelPickerSelectName] && this.values[SubscriptionFields.ChannelPickerSelectName].value) {
            channelID = this.values[SubscriptionFields.ChannelPickerSelectName].value;
        }
        const pairs = TriggerFields.ActionValuePairs;
        pairs[TriggerFields.ChannelIDKey] = channelID;
        return JSON.stringify(pairs);
    }

    getChannelIDobject(): {} {
        const fieldName = SubscriptionFields.ChannelPickerSelectName;
        const channelID = this.values[fieldName].value;
        return {fieldName: channelID};
    }

    addTitle(): void {
        let title = SubscriptionFields.PrefixTriggersTitle;
        title += this.context.channel_id;
        title += ' ' + this.values[SubscriptionFields.SubTextName];
        this.addField('title', title);
    }

    addDescription(): void {
        const description = String(this.values[SubscriptionFields.SubTextName]);
        this.addField('description', description);
    }

    addField(key: string, value: any): void {
        this.trigger[key] = value;
    }

    isNewTrigger(): boolean {
        const subID = this.values[SubscriptionFields.SubSelectName].value;
        return subID === SubscriptionFields.NewSub_OptionValue;
    }

    addConditions(): void {
        const conditions: ZDTriggerConditions = {
            any: [],
        };
        for (const checkbox of SubscriptionFields.ConditionsCheckBoxFields) {
            if (this.values[checkbox]) {
                const entry: ZDTriggerCondition = {
                    field: checkbox,
                    operator: 'changed',
                };
                conditions.any.push(entry);
            }
        }

        // do not let subscriptions without a condition be created...
        if (conditions.any.length === 0) {
            throw new Error('Must select at least one condition');
        }

        this.addField('conditions', conditions);
    }
}

export function newTriggerFromForm(call: AppCallRequest): any {
    const trigger = new TriggerFromFormImpl(call).getTrigger();
    return trigger;
}

