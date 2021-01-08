import {Tickets} from 'node-zendesk';

import {AppFormValue, AppFormValues} from 'mattermost-redux/types/apps';

import {fieldNames} from '../utils';

import {configStore} from '../store';

export const getTicketFromForm = (values: AppFormValues): Tickets.CreatePayload => {
    const ticket: Tickets.CreateModel = {
        comment: {
            body: getMessage(values),
        },
    };
    return mapFormValuesToTicket(ticket, values);
};

// mapFormValuesToTicket returns a zendesk ticket with AppCall values mapped
// 1:1 to a zendesk ticket
function mapFormValuesToTicket(ticket: Tickets.CreateModel, formValues: AppFormValues): Tickets.CreatePayload {
    const customRegex = RegExp(`${fieldNames.customPrefix}*`);
    const customFields: Tickets.Field[] = [];

    // app form values that are not to be 1:1 mapped to zendesk fields
    const omitFields = [fieldNames.additionalMessage, fieldNames.postMessage];

    Object.keys(formValues).forEach((formName) => {
        switch (true) {
        case omitFields.includes(formName):
            return;

        // if a form is not defined, selected, or checked in the modal, its
        // value will be null. continue to next field
        case !formValues[formName]:
            return;

        // custom fields are saved by ID and value
        case customRegex.test(formName):
            customFields.push(getFieldPair(formValues, formName));
            return;

        default:
        {
            // app form field names were mapped to a corresponding Zendesk field name. Save them
            // directly to the ticket payload
            // check if the value is in an object and not the single value of the key
            const value = getFormValue(formValues, formName);
            ticket[formName] = value;
        }
        }
    });

    // only save custom fields if one exists
    if (customFields.length > 0) {
        ticket.custom_fields = customFields;
    }

    return {ticket};
}

function getFormValue(formValues: AppFormValues, formName: string): AppFormValue {
    let formValue: AppFormValue = formValues[formName];
    if (formValue.value) {
        formValue = formValue.value;
    }
    return formValue;
}

function getFieldPair(formValues: AppFormValues, formName: string): Tickets.Field {
    const id = Number(formName.replace(fieldNames.customPrefix, ''));
    const value = getFormValue(formValues, formName);
    return {id, value};
}

function getMessage(formValues: AppFormValues): string {
    const mmSignature = '*message created from Mattermost message.*\n' + configStore.getSiteURL();

    const additionalMessage = formValues[fieldNames.additionalMessage] || '';
    const postMessage = formValues[fieldNames.postMessage] || '';

    const zdMessage = additionalMessage + '\n' +
            postMessage + '\n' +
            mmSignature;

    return zdMessage;
}

export default getTicketFromForm;
