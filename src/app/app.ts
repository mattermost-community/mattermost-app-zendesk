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
                comment: {
                    body: zdMessage,
                },
            },
        };
        return ticket;
    }

    // getCreateFormResponse returns a form response to create a ticket from a post
    getCreateFormResponse(message: string): AppCallResponse {
        const response: AppCallResponse = {
            type: 'form',
            form: {
                title: 'Create Zendesk Ticket',
                header: 'Create a Zendesk from Mattermost by filling in the required fields and clicking the submit button. Addition text can be added in the `Optional message` form.',
                footer: 'Message modal form footer',
                fields: [
                    {
                        name: 'subject',
                        description: 'zendesk subject',
                        type: 'text',
                        is_required: true,
                        label: 'User',
                        hint: 'Zendesk ticket subject',
                        position: 1,
                        modal_label: 'Ticket subject',
                    },
                    {
                        name: 'type',
                        type: 'static_select',
                        options: [
                            {
                                label: 'problem',
                                value: 'problem',
                            },
                            {
                                label: 'incident',
                                value: 'incident',
                            },
                        ],
                        is_required: true,
                        label: 'User',
                        hint: 'Zendesk ticket type',
                        position: 1,
                        modal_label: 'Ticket type',
                    },
                    {
                        name: 'additional_message',
                        description: 'zendesk additional message',
                        type: 'text',
                        label: 'message',
                        hint: 'Add additional message to the Zendesk ticket',
                        modal_label: 'Optional message',
                        subtype: 'textarea',
                        min_length: 2,
                        max_length: 1024,
                    },
                    {
                        name: 'post_message',
                        description: 'zendesk',
                        type: 'text',
                        is_required: true,
                        value: message,
                        label: 'message',
                        modal_label: 'Mattermost message',
                        subtype: 'textarea',
                        min_length: 2,
                        max_length: 1024,
                    },
                ],

            },
        };
        return response;
    }
}

export default new App();
