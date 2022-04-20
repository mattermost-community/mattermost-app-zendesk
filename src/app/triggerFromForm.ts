import {AppCallRequest, AppCallValues, AppContext} from 'types/apps';

import {ZDTrigger, ZDTriggerCondition, ZDTriggerConditions, ZDTriggerPayload} from '../types/zendesk';

import {getCallValueConditions} from '../utils/utils';
import {SubscriptionFields, TriggerFields} from '../constants/zendesk';

interface TriggerFromFrom {
    getTrigger(): ZDTriggerPayload;
}

export class TriggerFromFormImpl implements TriggerFromFrom {
    values: AppCallValues;
    context: AppContext;
    targetID: string;
    trigger: ZDTrigger

    constructor(call: AppCallRequest, targetID: string) {
        this.values = call.values as AppCallValues;
        this.context = call.context;
        this.targetID = targetID;
        this.trigger = {} as ZDTrigger;
        this.buildTrigger();
    }

    getTrigger(): ZDTriggerPayload {
        return {trigger: this.trigger};
    }

    buildTrigger(): void {
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
    }

    addActions(): void {
        const actions = [
            {
                field: TriggerFields.ActionField,
                value: [
                    this.targetID,
                    this.getJSONDataFields(),
                ],
            },
        ];
        this.addField('actions', actions);
    }

    // getJSONDataFields constructs the object text string for a trigger
    getJSONDataFields(): string {
        // Default to the viewing channel_id
        let channelID = this.context.channel?.id;

        // If channel picker exists, use its channel ID value
        if (this.values[SubscriptionFields.ChannelPickerSelectName] && this.values[SubscriptionFields.ChannelPickerSelectName].value) {
            channelID = this.values[SubscriptionFields.ChannelPickerSelectName].value;
        }
        const pairs = TriggerFields.ActionValuePairs;
        pairs[TriggerFields.ChannelIDKey] = channelID;
        return JSON.stringify(pairs);
    }

    addTitle(): void {
        const title = [
            SubscriptionFields.PrefixTriggersTitle,
            SubscriptionFields.RegexTriggerInstance + this.context.mattermost_site_url,
            SubscriptionFields.RegexTriggerTeamID + this.context.team?.id,
            SubscriptionFields.RegexTriggerChannelID + this.context.channel?.id,
            ' ' + this.values[SubscriptionFields.SubTextName],
        ].join('');
        this.addField('title', title);
    }

    addDescription(): void {
        const description = String(this.values[SubscriptionFields.SubTextName]);
        this.addField('description', description);
    }

    addField(key: string, value: unknown): void {
        this.trigger[key] = value;
    }

    isNewTrigger(): boolean {
        const subID = this.values[SubscriptionFields.SubSelectName].value;
        return subID === SubscriptionFields.NewSub_OptionValue;
    }

    addConditions(): void {
        const conditions: ZDTriggerConditions = {
            any: [],
            all: [],
        };

        const types: string[] = SubscriptionFields.ConditionTypes;
        for (const type of types) {
            const callValueConditions = getCallValueConditions(this.values, type);
            const keys = Object.keys(callValueConditions).sort();
            keys.forEach((key: string) => {
                const condition = callValueConditions[key];
                if (!condition.field) {
                    return;
                }

                const entry: ZDTriggerCondition = {
                    field: condition.field.value,
                    operator: condition.operator.value,
                    value: undefined, //  ZD API requires value field even if null
                };

                if (condition.value) {
                    entry.value = condition.value;

                    // If the call value has a value it is a select option.
                    if (condition.value.value) {
                        entry.value = condition.value.value;
                    }
                }
                conditions[type].push(entry);
            });
        }

        // Do not let subscriptions without a condition be created...
        if (conditions.any.length === 0 && conditions.all.length === 0) {
            throw new Error('Must select at least one condition');
        }
        this.addField('conditions', conditions);
    }
}

export function newTriggerFromForm(call: AppCallRequest, targetID: string): ZDTriggerPayload {
    const trigger = new TriggerFromFormImpl(call, targetID).getTrigger();
    return trigger;
}
