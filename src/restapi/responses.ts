import {AppCallResponse, AppSelectOption} from 'mattermost-redux/types/apps';

class Responses {
    // createForm returns a form response to create a ticket from a post
    createForm(message: string): AppCallResponse {
        const response: AppCallResponse = {
            type: 'form',
            form: {
                title: 'Create Zendesk Ticket',
                header: 'Create a Zendesk from Mattermost by filling in the required fields and clicking the submit button. Addition text can be added in the `Optional message` form.',
                footer: 'Message modal form footer',
                fields: [
                    {
                        name: 'subject',
                        type: 'text',
                        is_required: true,
                        hint: 'subject',
                        modal_label: 'Subject',
                    },
                    {
                        name: 'type',
                        type: 'static_select',
                        options: getStaticSelectOptions(['problem', 'incident', 'question', 'task']),
                        is_required: true,
                        hint: 'type',
                        modal_label: 'Type',
                    },
                    {
                        name: 'priority',
                        type: 'static_select',
                        options: getStaticSelectOptions(['urgent', 'high', 'normal', 'low']),
                        is_required: true,
                        hint: 'priority',
                        modal_label: 'Priority',
                    },
                    {
                        name: 'additional_message',
                        type: 'text',
                        hint: 'Add additional message to the Zendesk ticket',
                        modal_label: 'Optional message',
                        subtype: 'textarea',
                        min_length: 2,
                        max_length: 1024,
                    },
                    {
                        name: 'post_message',
                        type: 'text',
                        is_required: true,
                        value: message,
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

function getStaticSelectOptions(values: string[]): AppSelectOption[] {
    const options: Array<AppSelectOption> = [];
    for (const key of values) {
        options.push({label: key, value: key});
    }
    return options;
}

export default new Responses();
