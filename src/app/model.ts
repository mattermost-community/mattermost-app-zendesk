import {Tickets} from 'node-zendesk';

import {AppFormValue, AppFormValues} from 'mattermost-redux/types/apps';

import {AppFieldNames, ZDFieldValidation, getMultiselectValues} from '../utils';

import {configStore} from '../store';

export type FieldValidationErrors = {[name: string]: string};

interface ITicketFromFrom {
    getTicket(): Tickets.CreatePayload;
    fieldValidationErrors: FieldValidationErrors;
}

export class TicketFromForm implements ITicketFromFrom {
    formValues: AppFormValues;
    ticket: Tickets.CreateModel;
    fieldValidationErrors: FieldValidationErrors

    constructor(values: AppFormValues) {
        this.formValues = values;
        this.fieldValidationErrors = {};
        this.ticket = {
            comment: {
                body: this.getPostMessage(),
            },
        };
    }

    getPostMessage(): string {
        const mmSignature = '*message created from Mattermost message.*\n' + configStore.getSiteURL();

        const additionalMessage = this.formValues[AppFieldNames.AdditionalMessage] || '';
        const postMessage = this.formValues[AppFieldNames.PostMessage] || '';

        const zdMessage = additionalMessage + '\n' +
                postMessage + '\n' +
                mmSignature;

        return zdMessage;
    }

    getTicket(): Tickets.CreatePayload {
        return this.mapFormValuesToTicket(this.ticket);
    }

    // mapFormValuesToTicket returns a zendesk ticket with AppCall values mapped
    // 1:1 to a zendesk ticket
    mapFormValuesToTicket(ticket: Tickets.CreateModel): Tickets.CreatePayload {
        // app form values that are not to be 1:1 mapped to zendesk fields
        const omitFields = [AppFieldNames.AdditionalMessage, AppFieldNames.PostMessage];

        // iterate through each field and build the Zendesk ticket
        Object.keys(this.formValues).forEach((fieldName) => {
            switch (true) {
            case omitFields.includes(fieldName):
                return;

            // if a form is not defined, selected, or checked in the modal, its
            // value will be null. continue to next field
            case !this.formValues[fieldName]:
                return;

            // field is a custom field
            case fieldName.startsWith(AppFieldNames.CustomFieldPrefix):
                this.handleCustomField(fieldName);
                return;

            default:
                // app form field names were mapped to a corresponding Zendesk field name. Save them
                // directly to the ticket payload
                ticket[fieldName] = this.getFieldValue(fieldName);
            }
        });

        return {ticket};
    }

    handleCustomField(fieldName: string): void {
        const typePrefix = fieldName.replace(AppFieldNames.CustomFieldPrefix, '');
        const type = typePrefix.split('_')[0];
        const id = Number(typePrefix.split('_')[1]);

        let fieldValue = this.getFieldValue(fieldName) as string;
        this.validateField(fieldName, type, fieldValue);

        // if multiselect, the value is an array of values
        if (Array.isArray(this.formValues[fieldName])) {
            fieldValue = getMultiselectValues(this.formValues[fieldName]);
        }

        const pair: Tickets.Field = {id, value: fieldValue};
        this.addCustomField(pair);
    }

    validateField(fieldName: string, type: string, value: string): void {
        if (!ZDFieldValidation[type]) {
            return;
        }
        const regex = RegExp(ZDFieldValidation[type].Regex);
        if (!regex.test(value)) {
            const err = ZDFieldValidation[type].RegexError;
            this.fieldValidationErrors[fieldName] = err;
        }
    }

    addCustomField(customPair: Tickets.Field): void {
        if (!this.ticket.custom_fields) {
            this.ticket.custom_fields = [];
        }
        this.ticket.custom_fields.push(customPair);
    }

    // getFieldValue converts app field value to a zendesk field value
    getFieldValue(fieldName: string): AppFormValue {
        let fieldValue: AppFormValue = this.formValues[fieldName];
        if (fieldValue.value) {
            fieldValue = fieldValue.value;
        }
        return fieldValue;
    }
}

export function newTicketFromForm(values: AppFormValues): [Tickets.CreatePayload, any] {
    const ticket = new TicketFromForm(values);
    return [ticket.getTicket(), ticket.fieldValidationErrors];
}
