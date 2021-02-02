import {AppCall, AppForm} from 'mattermost-redux/types/apps';

import {Routes, ZDIcon} from '../utils';

import {FormFields} from './form_fields';

// newCreateTicketForm returns a form response to create a ticket from a post
export async function newCreateTicketForm(call: AppCall): Promise<AppForm> {
    const formFields = new FormFields(call);
    const fields = await formFields.getFields();

    const form: AppForm = {
        title: 'Create Zendesk Ticket',
        header: 'Create a Zendesk ticket from Mattermost by filling out and submitting this form. Additional text can be added in the `Optional Message` field.',
        icon: ZDIcon,
        fields,
        call: {
            url: Routes.App.CallPathSubmitOrUpdateCreateTicketForm,
        },
    };
    return form;
}
