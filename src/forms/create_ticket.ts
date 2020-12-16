import {AppCall, AppCallResponse, AppSelectOption} from 'mattermost-redux/types/apps';

import {makeOptions} from '../utils/utils';

// newCreateTicketForm returns a form response to create a ticket from a post
export function newCreateTicketForm(call: AppCall): AppCallResponse {
    const postMessage: string = call.context.post.message;
    const callResponse: AppCallResponse = {
        type: 'form',
        form: {
            title: 'Create Zendesk Ticket',
            header: 'Create a Zendesk ticket from Mattermost by filling out and submitting this form. Additional text can be added in the `Optional Message` field.',
            footer: 'Message modal form footer',
            fields: [
                {
                    name: 'subject',
                    modal_label: 'Subject',
                    type: 'text',
                    is_required: true,
                },
                {
                    name: 'type',
                    modal_label: 'Type',
                    type: 'static_select',
                    options: makeOptions(['problem', 'incident', 'question', 'task']),
                    is_required: false,
                },
                {
                    name: 'priority',
                    modal_label: 'Priority',
                    type: 'static_select',
                    options: makeOptions(['urgent', 'high', 'normal', 'low']),
                    is_required: false,
                },
                {
                    name: 'additional_message',
                    modal_label: 'Optional message',
                    type: 'text',
                    description: 'Add additional message to the Zendesk ticket',
                    subtype: 'textarea',
                    min_length: 2,
                    max_length: 1024,
                },
                {
                    name: 'post_message',
                    modal_label: 'Mattermost message',
                    type: 'text',
                    is_required: true,
                    value: postMessage,
                    subtype: 'textarea',
                    min_length: 2,
                    max_length: 1024,
                },
            ],

        },
    };
    return callResponse;
}
