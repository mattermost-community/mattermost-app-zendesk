import {Users} from 'node-zendesk';

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

export type ZDTriggerPayload = {
    trigger: ZDTrigger;
}

interface CustomFieldOptions {
    [key: string]: unknown;
}

export type ZDUserField = Users.Fields.UserField & {
    required_in_portal: boolean
    system_field_options?: CustomFieldOptions[];
}
