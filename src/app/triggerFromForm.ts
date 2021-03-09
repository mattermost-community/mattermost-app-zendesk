import {Tickets} from 'node-zendesk';

import {AppContext, AppCallValues} from 'mattermost-redux/types/apps';

import {SubscriptionFields, TriggerFields} from '../utils/constants';

interface ITriggerFromFrom {
    getTrigger(): Tickets.CreatePayload;
}

export class TriggerFromForm implements ITriggerFromFrom {
    values: AppCallValues;
    context: AppContext;
    trigger: any

    constructor(context: AppContext, values: AppCallValues) {
        this.values = values;
        this.context = context;
        this.trigger = {};
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
        const channelID = this.values[SubscriptionFields.ChannelPickerSelectName].value;
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

export function newTriggerFromForm(context: AppContext, values: AppCallValues): any {
    const trigger = new TriggerFromForm(context, values).getTrigger();
    return trigger;
}

