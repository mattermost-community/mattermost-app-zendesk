import {Tickets, CreatePayload} from 'node-zendesk';

import {config} from '../store';

type CreateTicketFormValues = {
    subject: string;
    type: string;
    priority: string;
    additional_message: string;
    post_message: string;
}

export const getTicketForPost = (values: CreateTicketFormValues): CreatePayload => {
    const mmSignature = '*message created from Mattermost message.*\n' + config.getSiteURL();

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
};

export default getTicketForPost;
