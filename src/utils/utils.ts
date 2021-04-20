import {AppSelectOption, AppField, AppContext} from 'mattermost-redux/types/apps';
import GeneralConstants from 'mattermost-redux/constants/general';
import {Channel} from 'mattermost-redux/types/channels';

import {getManifest} from 'manifest';
import {AppConfigStore} from 'store/config';

import {SubscriptionFields} from './constants';

export type Oauth2App = {
    client_id: string;
    client_secret: string;
}

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
        console.log('malformed Mattermost Trigger title', newTitle);
    }
    return newTitle[3];
};

export type parsedTriggerTitle = {
    title: string;
    channelID: string;
    instance: string
}

// parseTriggerTitle extracts the name, instance, and channelID from a saved Zendesk
// trigger title
export const parseTriggerTitle = (title: string): parsedTriggerTitle => {
    const re = new RegExp(SubscriptionFields.RegexTriggerTitle);
    const match = title.match(re) || '';
    if (!match) {
        console.log('malformed Mattermost Trigger title', title);
    }
    return {
        title: match[0],
        instance: match[1],
        channelID: match[2],
    };
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

export function baseUrlFromContext(context: AppContext): string {
    return context.mattermost_site_url || 'http://localhost:8065';
}

// makeBulletedList returns a bulleted list of items with options header
// pretext
export function makeBulletedList(pretext: string, items: string[]): string {
    let text = '* ' + items.join('\n* ');
    if (pretext) {
        text = `###  ${pretext}\n` + text;
    }
    return text;
}

export function getStaticURL(context: AppContext, name:string): string {
    return context.mattermost_site_url + '/plugins/com.mattermost.apps/apps/' + getManifest().app_id + '/static/' + name;
}

export function isConfigured(context: AppContext): boolean {
    return Boolean(context.oauth2.client_id && context.oauth2.client_secret);
}

export function isUserSystemAdmin(context: AppContext): boolean {
    return Boolean(context.acting_user.roles && context.acting_user.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE));
}

export function isConnected(context: AppContext): boolean {
    if (context.oauth2.user && context.oauth2.user.access_token && context.oauth2.user.access_token !== '') {
        return true;
    }
    return false;
}

export function webhookConfigured(config: AppConfigStore): boolean {
    return Boolean(config.zd_target_id && config.zd_target_id !== '');
}
