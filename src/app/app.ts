import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppState, AppCallResponse, AppCallValues, AppContext} from 'mattermost-redux/types/apps';
import {Tickets, CreatePayload} from 'node-zendesk';

import mmClient from '../mattermost/client';
import * as zendesk from '../zendesk/client';

import manifest from '../../manifest';

import store from './store';

const username = process.env.ZENDESK_USERNAME as string;
const token = process.env.ZENDESK_API_TOKEN as string;
const apiURL = process.env.ZENDESK_URL + '/api/v2' as string;

class App {
    async createTicketFromPost(appCall: AppCall): Promise<string> {
        const ticket = this.getTicketForPost(appCall.values);

        const zdClient = zendesk.newClient(username, token, apiURL);

        const result = await zdClient.tickets.create(ticket);
        const user = await zdClient.users.show(result.requester_id);

        const host = process.env.ZENDESK_URL;
        const message = `${user.name} created ticket [#${result.id}](${host}/agent/tickets/${result.id}) [${result.subject}]`;
        await this.createBotPost(appCall.context, message);
    }

    async createBotPost(context: AppContext, message: string) {
        const client = mmClient;
        client.setToken(store.getBotAccessToken());

        const post: Post = {
            message,
            channel_id: context.channel_id,
            root_id: context.post_id,
        };
        client.createPost(post);
    }

    getTicketForPost(values: AppCallValues): CreatePayload {
        const mmSignature = '*message created from Mattermost message.*\n';

        const zdMessage = values.additional_message + '\n' +
            values.post_message + '\n' +
            mmSignature;

        const ticket: Tickets.CreatePayload = {
            ticket: {
                subject: values.subject,
                type: values.type,
                priority: values.priority,
                comment: {
                    body: zdMessage,
                },
            },
        };
        return ticket;
    }

    getManifest(): CreatePayload {
        return manifest;
    }
}

export default new App();
