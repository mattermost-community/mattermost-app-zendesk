import {Tickets, TicketType, Priority} from 'node-zendesk';

import {configStore} from '../store';

type CreateTicketFormValues = {
    subject: string;
    type: TicketType;
    priority: Priority;
    additional_message: string;
    post_message: string;
}

export const getTicketFromForm = (values: CreateTicketFormValues): Tickets.CreatePayload => {
    const mmSignature = '*message created from Mattermost message.*\n' + configStore.getSiteURL();

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

export default getTicketFromForm;
