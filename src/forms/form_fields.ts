import {AppCall, AppField} from 'mattermost-redux/types/apps';
import {Client, Tickets, UserField} from 'node-zendesk';

import {newZDClient} from '../clients';
import {tryPromiseWithMessage} from '../utils';
import {oauthStore} from '../store';

import {FieldMapper} from './field_mapper';

interface Ifields {
    getFields(): Promise<AppField[]>;
}

// FormFields provides a method to retrieve viewable modal app fields
export class FormFields implements Ifields {
    private call: AppCall;

    constructor(call: AppCall) {
        this.call = call;
    }

    // getFields returns a list of viewable app fields that have been mapped from Zendesk form fields
    async getFields(): Promise<AppField[]> {
        const userID = this.call.context.acting_user_id || '';
        const token = oauthStore.getToken(userID);
        if (!token) {
            throw new Error('Failed to get user access_token');
        }
        const zdClient: Client = newZDClient(token);
        const zdTicketForms = await tryPromiseWithMessage(zdClient.ticketforms.list(), 'Failed to fetch ticket forms');

        // show the form selector when intially opening the modal
        const mapper = new FieldMapper(this.call);
        const formField = mapper.mapFormsToSelectField(zdTicketForms);
        const appFields = [formField];

        // only show form select field until user selects a form select value
        if (!formField.value) {
            return appFields;
        }

        // get the form id from the selected form field value
        const formID = formField.value.value;

        const zdFormFieldIDs = this.getTicketFieldIDs(zdTicketForms, formID);
        const zdTicketFields = await tryPromiseWithMessage(zdClient.ticketfields.list(), 'Failed to fetch ticket fields');
        const zdViewableFields = this.getViewableFields(zdTicketFields, zdFormFieldIDs);
        const formFields = mapper.mapZdFieldsToAppFields(zdViewableFields);

        appFields.push(...formFields);

        return appFields;
    }

    // getTicketFieldIDs returns the list of all fields in a Zendesk form
    private getTicketFieldIDs(forms: any, id: number): number[] {
        const ids = forms.find((form: any) => {
            return form.id.toString() === id;
        }).ticket_field_ids;
        return ids;
    }

    // getViewableFields returns a list of viewable Zendesk field IDs
    private getViewableFields(ticketFields: UserField[], formIDs: number[]): Tickets.Field[] {
        const fields = [];
        ticketFields.forEach((field: UserField) => {
            // omit fields that do not show up in the create ticket modeal in Zendesk
            // but are returned in the ticketFields query
            const omitFields = ['Group', 'Status'];
            if (omitFields.includes(field.title)) {
                return;
            }

            // only keep fields listed in formIDs
            if (formIDs.includes(field.id)) {
                fields.push(field);
            }
        });
        return fields;
    }
}
