import {Dictionary} from 'mattermost-redux/types/utilities';

export type ZDTriggerCondition = {
    field: string;
    operator: string;
    value?: string;
}

export type ZDTriggerConditions = {
    all?: ZDTriggerCondition[];
    any: ZDTriggerCondition[];
}

export type ZDTrigger = {
    url: string;
    id: number;
    title: string;
    conditions: ZDTriggerConditions
}

