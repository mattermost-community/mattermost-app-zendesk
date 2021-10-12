import {AppSelectOption, AppField, AppCallValues} from 'mattermost-redux/types/apps';
import GeneralConstants from 'mattermost-redux/constants/general';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {Oauth2App} from '../types/apps';
import {AppConfigStore} from '../store/config';

import {SubscriptionFields, ZDRoles} from './constants';
import {StoredOauthUserToken, ZDRole, ZDTriggerCondition} from './ZDTypes';

export type ZDFieldOption = {
    name: string;
    value: string;
}

export type ZDFormFieldOption = {
    name: string;
    id: string;
    ticket_field_ids: string[];
}

type ZDSubscriptionFieldOption = {
    title: string;
    id: number;
}

const getDisplaySubTitleOption = (option: ZDSubscriptionFieldOption): string => {
    const re = new RegExp(SubscriptionFields.RegexTriggerTitle);
    const newTitle = option.title.match(re) || '';
    if (!newTitle) {
        throw new Error('malformed Mattermost Trigger title ' + newTitle);
    }
    return newTitle[4];
};

export type parsedTriggerTitle = {
    title: string;
    channelID: string;
    teamID: string;
    instance: string
}

// parseTriggerTitle extracts the name, instance, and channelID from a saved Zendesk trigger title
export const parseTriggerTitle = (title: string): parsedTriggerTitle => {
    const re = new RegExp(SubscriptionFields.RegexTriggerTitle);
    const match = title.match(re);
    if (!match) {
        throw new Error('unable to parse Mattermost Trigger title ' + title);
    }
    return {
        title: match[0],
        instance: match[1],
        teamID: match[2],
        channelID: match[3],
    };
};

export type CallValueCondition = {
    field?: AppSelectOption
    operator?: AppSelectOption
    value?: any
}

export type CallValueConditions = {
    [key: number]: CallValueCondition
}

// createConditionsFromCall returns an array of Zendesk conditions constructed from the App call values
export const createZdConditionsFromCall = (cValues: AppCallValues | undefined, type: string): ZDTriggerCondition[] => {
    const cValueConditions = getCallValueConditions(cValues, type);
    const conditions: ZDTriggerCondition[] = [];
    for (const condition of Object.values(cValueConditions)) {
        if (!condition.field) {
            continue;
        }
        const newCond: ZDTriggerCondition = {
            field: condition.field.value,
        };
        if (condition.operator) {
            newCond.operator = condition.operator.value;
        }
        if (condition.value) {
            newCond.value = condition.value.value || condition.value;
        }
        conditions.push(newCond);
    }
    return conditions;
};

// getCallValueConditions constructs a dictionary of CallValueConditions.
// A CallValueCondition is a group of up to three call values representing a condition in Zendesk.
export const getCallValueConditions = (cValues: AppCallValues | undefined, type: string): CallValueConditions => {
    // Get all the call values from the specified "any" or "all" type sections
    const conditions: CallValueConditions = {};
    if (!cValues) {
        return conditions;
    }

    const filteredCValues = Object.entries(cValues).
        filter((entry) => {
            return entry[0].startsWith(`${type}_`);
        });

    // Create the CallValueConditions object
    for (const callVal of filteredCValues) {
        const [, index, name] = callVal[0].split('_');
        if (!conditions[index]) {
            conditions[index] = {};
        }
        conditions[index][name] = callVal[1];
    }
    return conditions;
};

export const makeOption = (option: ZDFieldOption): AppSelectOption => ({label: option.name, value: option.value});
export const makeOptions = (options: ZDFieldOption[]): AppSelectOption[] => options.map(makeOption);

export const makeFormOption = (option: ZDFormFieldOption): AppSelectOption => ({label: option.name, value: option.id.toString()});
export const makeFormOptions = (options: ZDFormFieldOption[]): AppSelectOption[] => options.map(makeFormOption);

export const makeSubscriptionOption = (option: ZDSubscriptionFieldOption): AppSelectOption => ({label: getDisplaySubTitleOption(option), value: option.id.toString()});
export const makeSubscriptionOptions = (options: ZDSubscriptionFieldOption[]): AppSelectOption[] => options.map(makeSubscriptionOption);

export const getMultiselectValue = (option: ZDFieldOption): string => option.value;
export const getMultiselectValues = (options: ZDFieldOption[]): string[] => options.map(getMultiselectValue);

export const makeChannelOption = (option: Channel): AppSelectOption => ({label: option.display_name, value: option.id});
export const makeChannelOptions = (options: Channel[]): AppSelectOption[] => options.map(makeChannelOption);

export function errorWithMessage(err: Error, message: string): string {
    return `"${message}".  ` + err.message;
}

export async function tryPromiseWithMessage(p: Promise<any>, message: string): Promise<any> {
    return p.catch((err) => {
        throw new Error(errorWithMessage(err, message));
    });
}

export function isFieldValueSelected(field: AppField): boolean {
    return Boolean(field.value);
}

export function baseUrlFromContext(mattermostSiteUrl: string): string {
    return mattermostSiteUrl || 'http://localhost:8065';
}

// makeBulletedList returns a bulleted list of items with options header pretext
export function makeBulletedList(pretext: string, items: string[]): string {
    let text = '* ' + items.join('\n* ');
    if (pretext) {
        text = `####  ${pretext}\n${text}`;
    }
    return text;
}

export function isConfigured(oauth2: Oauth2App): boolean {
    return Boolean(oauth2.client_id && oauth2.client_secret);
}

export function isUserSystemAdmin(actingUser: UserProfile): boolean {
    return Boolean(actingUser.roles && actingUser.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE));
}

export function isConnected(oauth2user: StoredOauthUserToken): boolean {
    if (oauth2user && oauth2user.token.access_token && oauth2user.token.access_token !== '') {
        return true;
    }
    return false;
}

export function isZdAgent(role: ZDRole): boolean {
    return role === ZDRoles.agent;
}

export function isZdAdmin(role: ZDRole): boolean {
    return role === ZDRoles.admin;
}

export function webhookConfigured(config: AppConfigStore): boolean {
    return Boolean(config.zd_target_id && config.zd_target_id !== '');
}