import zendesk, {ClientOptions} from 'node-zendesk';

import {AppContext} from 'mattermost-redux/types/apps';

import {Env} from '../utils';
import {oauthStore} from '../store';

interface Tickets {
    create(ticket: any): any;
    exportAudit(id: number): any;
}

interface TicketForms {
    list(): any;
}

interface TicketFields {
    list(): any;
}

interface Triggers {
    update(id: number): any;
    delete(id: number): any;
    create(trigger: any): any;
    search(query: string): any;
}
interface OauthTokens {
    current(): any;
    revoke(id: number): any;
}
interface Users {
    show(id: number): any;
}

// expose on the methods that will be used by the app
export interface ZDClient {
    tickets: Tickets;
    ticketforms: TicketForms;
    ticketfields: TicketFields;
    triggers: Triggers;
    oauthtokens: OauthTokens;
    users: Users;
}

export const newZDClient = (context: AppContext): ZDClient => {
    // get active mattermost user ID
    const mmUserID = context.acting_user_id || '';
    const token = oauthStore.getToken(mmUserID);
    if (!token) {
        throw new Error('Failed to get user access_token');
    }

    const options: ClientOptions = {
        username: '',
        token,
        remoteUri: Env.ZD.ApiURL,
        oauth: true,
    };

    return zendesk.createClient(options) as ZDClient;
};
