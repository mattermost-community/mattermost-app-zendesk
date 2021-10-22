import zendesk, {ClientOptions} from 'node-zendesk';

import {Routes} from '../utils';
import {newConfigStore} from '../store';

interface Tickets {
    create(ticket: any): any;
    exportAudit(id: number): any;
}

interface Targets {
    create(target: any): any;
    update(id: string, target: any): any;
}

export interface TicketForms {
    list(): any;
    show(id: number): any;
}

interface TicketFields {
    list(): any;
}

export interface Groups {
    show(id: number): any;
}

interface Triggers {
    definitions(): any;
    update(id: number, trigger: any): any;
    delete(id: number): any;
    create(trigger: any): any;
    search(query: string): any;
}

interface OauthTokens {
    list(): any
    revoke(id: number): any;
}

export interface Users {
    show(id: number): any;
    me(): any;
}

// Expose the methods that will be used by the app
export interface ZDClient {
    tickets: Tickets;
    ticketforms: TicketForms;
    ticketfields: TicketFields;
    targets: Targets;
    triggers: Triggers;
    oauthtokens: OauthTokens;
    users: Users;
    groups: Groups;
}

export type ZDClientOptions = {
    oauth2UserAccessToken: string,
    botAccessToken: string,
    mattermostSiteUrl: string
}

export const newZDClient = async (zdOptions: ZDClientOptions): Promise<ZDClient> => {
    const token = zdOptions.oauth2UserAccessToken;
    if (!token) {
        throw new Error('Failed to get oauth2 user access_token');
    }
    const config = await newConfigStore(zdOptions.botAccessToken, zdOptions.mattermostSiteUrl).getValues();
    const remoteUri = config.zd_url + Routes.ZD.APIVersion;
    const options: ClientOptions = {
        username: '',
        token,
        remoteUri,
        oauth: true,
    };

    return zendesk.createClient(options) as ZDClient;
};
