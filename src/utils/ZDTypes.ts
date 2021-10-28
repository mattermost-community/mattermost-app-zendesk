/* eslint-disable camelcase */
import {Users} from 'node-zendesk';
import ClientOAuth2 from 'client-oauth2';

export type ZDConditionOptionOperator = {
    title: string
    value: string
    terminal: boolean
}

export type ZDConditionOptionValue = {
    title: string
    value: string
    enabled: boolean
}

export type ZDConditionOption = {
    title: string
    subject: string
    text: string
    group: string
    nullable: boolean
    repeatable: boolean
    operators: ZDConditionOptionOperator[]
    values?: ZDConditionOptionValue[]
}

export type ZDTriggerCondition = {
    field: string
    operator?: string
    value?: string
}

export type ZDTriggerConditions = {
    all: ZDTriggerCondition[]
    any: ZDTriggerCondition[]
}

export type ZDTrigger = {
    url: string
    id: number
    title: string
    active: boolean
    conditions: ZDTriggerConditions
}

export type ZDTriggerPayload = {
    trigger: ZDTrigger
}

interface CustomFieldOptions {
    [key: string]: unknown
}

export type ZDUserField = Users.Fields.UserField & {
    required_in_portal: boolean
    system_field_options?: CustomFieldOptions[]
}

export type ZDToken = {
    url: string
    id: number
    user_id: number
    client_id: number
    token: string
    refresh_token: null
    created_at: string
    expires_at: null
    used_at: string
    scopes: string[]
}

export type ZDTokens = [
    {tokens: ZDToken[]}
]

export type ZDTokensResponse = {
    tokens: ZDTokens
    next_page: string
    previious_page: string
    count: number
}

export type ZDRole = 'admin' | 'agent' | ''

export type StoredOauthUserToken = {
    token: ClientOAuth2.Data
    role: ZDRole
}
