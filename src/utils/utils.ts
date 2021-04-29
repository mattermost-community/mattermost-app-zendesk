import {AppSelectOption, AppField} from 'mattermost-redux/types/apps';
import GeneralConstants from 'mattermost-redux/constants/general';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {Oauth2App, ZDOauth2User} from '../types/apps';
import {getManifest} from '../manifest';
import {AppConfigStore} from '../store/config';

import {SubscriptionFields} from './constants';

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

// parseTriggerTitle extracts the name, instance, and channelID from a saved Zendesk
// trigger title
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

// makeBulletedList returns a bulleted list of items with options header
// pretext
export function makeBulletedList(pretext: string, items: string[]): string {
    let text = '* ' + items.join('\n* ');
    if (pretext) {
        text = `###  ${pretext}\n` + text;
    }
    return text;
}

export function getStaticURL(mattermostSiteUrl: string, name:string): string {
    return mattermostSiteUrl + '/plugins/com.mattermost.apps/apps/' + getManifest().app_id + '/static/' + name;
}

export function isConfigured(oauth2: Oauth2App): boolean {
    return Boolean(oauth2.client_id && oauth2.client_secret);
}

export function isUserSystemAdmin(actingUser: UserProfile): boolean {
    return Boolean(actingUser.roles && actingUser.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE));
}

export function isConnected(oauth2user: ZDOauth2User): boolean {
    if (oauth2user && oauth2user.access_token && oauth2user.access_token !== '') {
        return true;
    }
    return false;
}

export function webhookConfigured(config: AppConfigStore): boolean {
    return Boolean(config.zd_target_id && config.zd_target_id !== '');
}

export type checkBox = {
    label: string
    name: string
}

export function getCheckBoxesFromTriggerDefinition(definitions: any): checkBox[] {
    const actions = definitions[0].definitions.actions;
    const checkboxes: checkBox[] = [];
    for (const action of actions) {
        const subject = action.subject;
        const isCustomField = subject.startsWith(SubscriptionFields.PrefixCustomDefinitionSubject);

        // restrict possible checkbox values for simplicity
        // - custom checkbox has only two possible values, but not supported by 'change'
        // - group === requester also not easily determined
        if (action.values && action.group === 'ticket' && action.subject !== 'follower' && !isCustomField && action.subject !== 'brand_id') {
            checkboxes.push({name: action.subject, label: action.title});
        }
    }
    return checkboxes;
}
