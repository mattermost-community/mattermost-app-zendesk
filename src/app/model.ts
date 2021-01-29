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
        this.mapFormValuesToTicket();
        return {ticket: this.ticket};
    }

    // mapFormValuesToTicket maps AppCall values 1:1 to a zendesk ticket
    mapFormValuesToTicket(): void {
        // get only the fields that will be mapped
        const prunedFormNames = this.pruneFieldNames();

        // iterate through each field and build the Zendesk ticket
        prunedFormNames.forEach((fieldName) => {
            // this is a custom field
            if (this.isCustomField(fieldName)) {
                this.mapCustomFieldToTicket(fieldName);
                return;
            }

            this.mapFieldToTicket(fieldName);
        });
    }

    // mapCustomFieldToTicket maps a custom to a zendesk ticket
    mapCustomFieldToTicket(fieldName: string): void {
        const [zdType, id] = this.getCustomZDFieldTypeAndID(fieldName);
        if (!zdType) {
            return;
        }

        let errMsg = '';
        let value: any;
        [value, errMsg] = this.getFieldValue(fieldName);
        if (errMsg !== '') {
            console.log(errMsg);
            return;
        }
        this.validateField(fieldName, zdType, value);

        // if multiselect, the value is an array of values
        if (Array.isArray(value)) {
            value = getMultiselectValues(value);
        }
        const zdField: Tickets.Field = {id, value};
        this.addCustomField(zdField);
    }

    // mapFieldToTicket maps a non-custom field directly to a zendesk ticket
    mapFieldToTicket(fieldName: string): void {
        this.ticket[fieldName] = this.getFieldValue(fieldName)[0];
    }

    getCustomZDFieldTypeAndID(fieldName: string): [string, number] {
        const prefix = fieldName.replace(AppFieldNames.CustomFieldPrefix, '');
        const splitted = prefix.split('_');
        if (splitted.length !== 2) {
            console.log('custom field name is not valid. fieldName =', fieldName);
            return ['', 0];
        }
        return [splitted[0], Number(splitted[1])];
    }

    validateField(fieldName: string, type: string, value: any): void {
        if (!ZDFieldValidation[type]) {
            return;
        }
        const regex = RegExp(ZDFieldValidation[type].Regex);
        if (!regex.test(value)) {
            const err = ZDFieldValidation[type].RegexError;
            this.fieldValidationErrors[fieldName] = err;
        }
    }

    // pruneFormFields removes field names that are not defined or will be omitted
    // during the field mapping process
    pruneFieldNames(): string[] {
        const prunedFormNames: string[] = [];
        Object.keys(this.formValues).forEach((fieldName) => {
            // form is not defined, selected, or checked in the modal or is an ommitted field
            if (this.isOmittedField(fieldName) || !this.formValues[fieldName]) {
                return;
            }

            // this field will be directly mapped to a zendesk ticket field
            prunedFormNames.push(fieldName);
        });

        return prunedFormNames;
    }

    addCustomField(customPair: Tickets.Field): void {
        if (!this.ticket.custom_fields) {
            this.ticket.custom_fields = [];
        }
        this.ticket.custom_fields.push(customPair);
    }

    // isCustomField determines if a field is custom based on the field name
    isCustomField(fieldName: string): boolean {
        return Boolean(fieldName.startsWith(AppFieldNames.CustomFieldPrefix));
    }

    // isOmittedField returns true if a field should not be mapped directly to
    // a zendesk ticket
    isOmittedField(fieldName: string): boolean {
        // app form values that are not to be 1:1 mapped to zendesk fields
        const omitFields = [AppFieldNames.AdditionalMessage, AppFieldNames.PostMessage];
        return Boolean(omitFields.includes(fieldName));
    }

    // getFieldValue converts app field value to a zendesk field value
    getFieldValue(fieldName: string): [Tickets.Field, string] {
        let fieldValue: any = this.formValues[fieldName];
        if (!fieldValue) {
            const errMsg = `custom field value is not defined for fieldName. fieldName = ${fieldName}`;
            return [fieldValue, errMsg];
        }
        if (fieldValue.value) {
            fieldValue = fieldValue.value;
        }
        return [fieldValue, ''];
    }
}

export function newTicketFromForm(values: AppFormValues): [Tickets.CreatePayload, FieldValidationErrors] {
    const ticket = new TicketFromForm(values);
    return [ticket.getTicket(), ticket.fieldValidationErrors];
}
