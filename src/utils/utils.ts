import {AppSelectOption, AppField, AppContext} from 'mattermost-redux/types/apps';
import {Channel} from 'mattermost-redux/types/channels';

import {SubscriptionFields} from './constants';

export type ZDFieldOption = {
    name: string;
    value: string;
}

export type ZDFormFieldOption = {
    name: string;
    id: number;
}

type ZDSubscriptionFieldOption = {
    title: string;
    id: number;
}

const getDisplaySubTitleOption = (option: ZDSubscriptionFieldOption): string => {
    const re = new RegExp(SubscriptionFields.RegexTriggerTitle);
    const newTitle = option.title.match(re)[2];
    return newTitle;
};

// getChannelIDFromTriggerTitle extracts the channelID from a saved Zendesk
// trigger title
export const getChannelIDFromTriggerTitle = (title: string): string => {
    const re = new RegExp(SubscriptionFields.RegexTriggerTitle);
    const match = title.match(re);
    if (!match) {
        console.log('malformed Mattermost Trigger title', match[1]);
    }
    return match[1];
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

export function errorWithMessage(err, message: string): string {
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

export function contextFromRequest(request: any): AppContext {
    return request.body.context;
}

export function baseUrlFromContext(context: AppContext): string {
    return context.mattermost_site_url || 'http://localhost:8065';
}

// getBulletedList returns a bulleted list of items with options header
// pretext
export function getBulletedList(pretext: string, items: string[]): string {
    let text = '* ' + items.join('\n* ');
    if (pretext) {
        text = `###  ${pretext}\n` + text;
    }
    return text;
}
