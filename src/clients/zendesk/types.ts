interface Tickets {
    create(ticket: any): any;
    exportAudit(id: number): any;
}

export type Webhook = {
    id: string;
    name: string;
    endpoint: string;
    description: string;
    http_method: string;
    request_format: string;
    status: string;
    subscriptions: string[];
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
