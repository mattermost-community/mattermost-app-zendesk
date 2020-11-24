import {Post} from 'mattermost-redux/types/posts';
import {AppCallResponse} from 'mattermost-redux/types/apps';
import {Tickets} from 'node-zendesk';

import mmClient from '../mattermost/client';
import zendeskClient from '../zendesk/client';

import store from './store';

const username = process.env.ZENDESK_USERNAME as string;
const token = process.env.ZENDESK_API_TOKEN as string;
const apiURL = process.env.ZENDESK_URL + '/api/v2' as string;

class App {
    async createTicketFromPost(ticket, channelId: string, userId: string, postId: string) {
        const zdClient = zendeskClient(username, token, apiURL);
        const result = await zdClient.tickets.create(ticket);
        const user = await zdClient.users.show(result.requester_id);
        const host = process.env.ZENDESK_URL;

        const message = `${user.name} created ticket [#${result.id}](${host}/agent/tickets/${result.id}) [${result.subject}]`;

        const post: Post = {
            message,
            channel_id: channelId,
            root_id: postId,
        };

        const client = mmClient;
        client.setToken(store.getBotAccessToken());
        const pRes = client.createPost(post);
    }

    getTicketForPost(values) {
        const zdSubject = values.subject;
        const mmSignature = '*message created from Mattermost message.*\n';

        const zdMessage = values.additional_message + '\n' +
            values.post_message + '\n' +
            mmSignature;

        const ticket: Tickets.CreatePayload = {
            ticket: {
                subject: zdSubject,
                type: values.type,
                priority: values.priority,
                comment: {
                    body: zdMessage,
                },
            },
        };
        return ticket;
    }
}

export default new App();
