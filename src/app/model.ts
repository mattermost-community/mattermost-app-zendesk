import {Tickets, CreatePayload} from 'node-zendesk';

import store from '../store/config';

type CreateTicketFormValues = {
    subject: string;
    type: string;
    priority: string;
    additional_message: string;
    post_message: string;
}

export const getTicketForPost = (values: CreateTicketFormValues): CreatePayload => {
    const mmSignature = '*message created from Mattermost message.*\n' + store.getSiteURL();

    const additionalMessage = values.additional_message || '';
    const postMessage = values.post_message || '';

    const zdMessage = additionalMessage + '\n' +
            postMessage + '\n' +
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
