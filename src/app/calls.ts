import {AppCallResponse, AppSelectOption} from 'mattermost-redux/types/apps';

class Calls {
    // createForm returns a form response to create a ticket from a post
    createForm(message: string): AppCallResponse {
        const call: AppCallResponse = {
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
                        options: getStaticSelectOptions(['problem', 'incident', 'question', 'task']),
                        is_required: false,
                    },
                    {
                        name: 'priority',
                        modal_label: 'Priority',
                        type: 'static_select',
                        options: getStaticSelectOptions(['urgent', 'high', 'normal', 'low']),
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
                        value: message,
                        subtype: 'textarea',
                        min_length: 2,
                        max_length: 1024,
                    },
                ],

            },
        };
        return call;
    }
}

function getStaticSelectOptions(values: string[]): AppSelectOption[] {
    const options: Array<AppSelectOption> = [];
    for (const key of values) {
        options.push({label: key, value: key});
    }
    return options;
}

export default new Calls();
