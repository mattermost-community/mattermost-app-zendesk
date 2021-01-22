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
        case customRegex.test(formName): {
            const customPair = getCustomFieldPair(formValues, formName);
            if (!ticket.custom_fields) {
                ticket.custom_fields = [];
            }
            ticket.custom_fields.push(customPair);
            return;
        }
        default:
        {
            // app form field names were mapped to a corresponding Zendesk field name. Save them
            // directly to the ticket payload
            // check if the value is in an object and not the single value of the key
            const value = getFieldValue(formValues, formName);
            ticket[formName] = value;
        }
        }
    });

    console.log('ticket = ', inspect(ticket, false, null, true /* enable colors */));
    return {ticket};
}

// getFieldValue converts app field value to a zendesk field value
function getFieldValue(formValues: AppFormValues, fieldName: string): AppFormValue {
    let fieldValue: AppFormValue = formValues[fieldName];
    if (fieldValue.value) {
        fieldValue = fieldValue.value;
    }
    return fieldValue;
}

function getCustomFieldPair(formValues: AppFormValues, fieldName: string): Tickets.Field {
    const getOption = (option) => (option.value);
    const getMultiselectValues = (options) => options.map(getOption);

    const id = Number(fieldName.replace(fieldNames.customPrefix, ''));

    // if multiselect, the value is an array of values
    if (formValues[fieldName].length) {
        return {id, value: getMultiselectValues(formValues[fieldName])};
    }
    return {id, value: getFieldValue(formValues, fieldName)};
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
