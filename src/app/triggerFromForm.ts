import {Tickets} from 'node-zendesk';

import {AppContext, AppFormValues, AppCall, AppForm} from 'mattermost-redux/types/apps';

import {SubscriptionFields, TriggerFields} from '../utils/constants';

interface TriggerFromFrom {
    getTrigger(): Tickets.CreatePayload;
}

export class TriggerFromFormImpl implements TriggerFromFrom {
    values: AppFormValues;
    context: AppContext;
    trigger: any

    constructor(call: AppCall) {
        this.values = call.values as AppFormValues;
        this.context = call.context;
        this.trigger = {};
    }

    getTrigger(): any {
        // If not a new trigger, add the trigger ID to the payload
        // This is a signal to update the trigger, not create a new one
        if (!this.isNewTrigger()) {
            const subID = this.values[SubscriptionFields.SubSelect_Name].value;
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
        const channelID = this.values[SubscriptionFields.ChannelPickerSelect_Name].value;
        const pairs = TriggerFields.ActionValuePairs;
        pairs[TriggerFields.ChannelIDKey] = channelID;
        return JSON.stringify(pairs);
    }

    getChannelIDobject(): {} {
        const fieldName = SubscriptionFields.ChannelPickerSelect_Name;
        const channelID = this.values[fieldName].value;
        return {fieldName: channelID};
    }

    addTitle(): void {
        let title = SubscriptionFields.PrefixTriggersTitle;
        title += this.context.channel_id;
        title += ' ' + this.values[SubscriptionFields.SubText_Name];
        this.addField('title', title);
    }

    addDescription(): void {
        const description = String(this.values[SubscriptionFields.SubText_Name]);
        this.addField('description', description);
    }

    addField(key: string, value: any): void {
        this.trigger[key] = value;
    }

    isNewTrigger(): boolean {
        const subID = this.values[SubscriptionFields.SubSelect_Name].value;
        return subID === SubscriptionFields.NewSub_OptionValue;
    }

    addConditions(): void {
        const conditions = {
            any: [],
        };
        for (const checkbox of SubscriptionFields.ConditionsCheckBoxFields) {
            if (this.values[checkbox]) {
                const entry = {
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

export function newTriggerFromForm(call: AppCall): any {
    const trigger = new TriggerFromFormImpl(call).getTrigger();
    return trigger;
}

