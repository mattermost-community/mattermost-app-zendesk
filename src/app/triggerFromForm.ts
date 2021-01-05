import {Tickets} from 'node-zendesk';

import {AppContext, AppCallValues} from 'mattermost-redux/types/apps';

import {SubscriptionFields, TriggerFields} from '../utils/constants';
import {FieldValidationErrors} from '../utils/call_responses';

interface ITriggerFromFrom {
    getTrigger(): Tickets.CreatePayload;
    fieldValidationErrors: FieldValidationErrors;
}

export class TriggerFromForm implements ITriggerFromFrom {
    values: AppCallValues;
    context: AppContext;
    trigger: any
    fieldValidationErrors: FieldValidationErrors

    constructor(values: AppCallValues, context: AppContext) {
        this.values = values;
        this.context = context;
        this.fieldValidationErrors = {};
        this.trigger = {};
    }

    getTrigger(): any {
        // If not a new trigger, add the trigger ID to the payload
        // This is a signal to update the trigger, not create a new one
        if (!this.isNewTrigger()) {
            const subID = this.values[SubscriptionFields.SubSelect_Name].value;
            this.addTriggerField('id', subID);
        }
        this.addTriggerField('title', this.getTriggerTitle());
        this.addTriggerField('description', this.getTriggerDescription());
        this.addTriggerField('actions', this.getTriggerActions());
        this.addTriggerField('conditions', this.getTriggerConditions());

        return {trigger: this.trigger};
    }

    getTriggerActions(): any[] {
        const actions = [
            {
                field: TriggerFields.ActionField,
                value: [
                    TriggerFields.TargetID,
                    this.getJSONDataFields(),
                ],
            },
        ];
        return actions;
    }

    // getJSONDataFields constructs the object text string for a trigger
    getJSONDataFields(): string {
        const channelID = this.values[SubscriptionFields.ChannelPickerSelect_Name].value;
        const pairs = TriggerFields.ActionValuePairs;
        pairs[TriggerFields.ChannelIDKey] = channelID;

        const objStrings = Object.entries(TriggerFields.ActionValuePairs).map((pair) => {
            const key = pair[0];
            const value = pair[1];
            return `"${key}": "${value}"`;
        });
        return '{' + objStrings.join(',') + '}';
    }

    getChannelIDobject(): {} {
        const fieldName = SubscriptionFields.ChannelPickerSelect_Name;
        const channelID = this.values[fieldName].value;
        return {fieldName: channelID};
    }

    getTriggerTitle(): string {
        let title = SubscriptionFields.PrefixTriggersTitle;
        title += this.context.channel_id;
        title += ' ' + this.values[SubscriptionFields.SubText_Name];
        return title;
    }

    getTriggerDescription(): string {
        return String(this.values[SubscriptionFields.SubText_Name]);
    }

    addTriggerField(key: string, value: any): void {
        this.trigger[key] = value;
    }

    isNewTrigger(): boolean {
        const subID = this.values[SubscriptionFields.SubSelect_Name].value;
        return Boolean(subID === SubscriptionFields.NewSub_OptionValue);
    }

    getTriggerConditions(): {} {
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
        return conditions;
    }
}

export function newTriggerFromForm(values: AppCallValues, context: AppContext): [any, FieldValidationErrors] {
    const trigger = new TriggerFromForm(values, context).getTrigger();
    return [trigger, trigger.fieldValidationErrors];
}

