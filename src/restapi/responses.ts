import {AppCallResponse, AppSelectOption} from 'mattermost-redux/types/apps';

// createFormResponse returns a form response to create a ticket from a post
function createFormResponse(message: string): AppCallResponse {
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
                    options: getTypeOptions(),
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

function getTypeOptions(): AppSelectOption[] {
    return [
        {
            label: 'problem',
            value: 'problem',
        },
        {
            label: 'incident',
            value: 'incident',
        },
        {
            label: 'question',
            value: 'question',
        },
        {
            label: 'task',
            value: 'task',
        },
    ];
}

export default createFormResponse;
