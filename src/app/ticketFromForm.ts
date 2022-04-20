import {Tickets} from 'node-zendesk';

import {AppCallRequest, AppContext, AppFormValues} from 'types/apps';

import {FieldValidationErrors} from '../utils/call_responses';
import {CreateTicketFields, ZDFieldValidation} from '../utils/constants';
import {baseUrlFromContext, getMultiselectValues, isFieldValueSelected} from '../utils/utils';

interface TicketFromFrom {
    getTicket(): Tickets.CreatePayload;
    fieldValidationErrors: FieldValidationErrors;
}

export class TicketFromFormImpl implements TicketFromFrom {
    context: AppContext;
    formValues: AppFormValues;
    ticket: Tickets.CreateModel;
    fieldValidationErrors: FieldValidationErrors

    constructor(call: AppCallRequest) {
        this.context = call.context;
        this.formValues = call.values as AppFormValues;
        this.fieldValidationErrors = {};
        this.ticket = {
            comment: {
                body: this.getPostMessage(),
            },
        };
    }

    getPostMessage(): string {
        const baseURL = baseUrlFromContext(this.context.mattermost_site_url);
        const postID = this.context.post?.id;
        const mmSignature = `\n*message created from [Mattermost message](${baseURL}/_redirect/pl/${postID}).*\n`;

        const additionalMessage = this.formValues[CreateTicketFields.NameAdditionalMessage] || '';
        const postMessage = this.formValues[CreateTicketFields.NamePostMessage] || '';

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
        // Get only the fields that will be mapped
        const prunedFormNames = this.pruneFieldNames();

        // Iterate through each field and build the Zendesk ticket
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

        // If multiselect, the value is an array of values
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
        const prefix = fieldName.replace(CreateTicketFields.PrefixCustomField, '');
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

    // pruneFormFields removes field names that are not defined or will be omitted during the field mapping process
    pruneFieldNames(): string[] {
        const prunedFormNames: string[] = [];
        Object.keys(this.formValues).forEach((fieldName) => {
            // Form is not defined, selected, or checked in the modal or is an omitted field
            if (this.isOmittedField(fieldName) || !this.formValues[fieldName]) {
                return;
            }

            // This field will be directly mapped to a zendesk ticket field
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
        return Boolean(fieldName.startsWith(CreateTicketFields.PrefixCustomField));
    }

    // isOmittedField returns true if a field should not be mapped directly to a zendesk ticket
    isOmittedField(fieldName: string): boolean {
        // App form values that are not to be 1:1 mapped to zendesk fields
        const omitFields = [CreateTicketFields.NameAdditionalMessage, CreateTicketFields.NamePostMessage];
        return Boolean(omitFields.includes(fieldName));
    }

    // getFieldValue converts app field value to a zendesk field value
    getFieldValue(fieldName: string): [Tickets.Field, string] {
        let fieldValue: any = this.formValues[fieldName];
        if (!fieldValue) {
            const errMsg = `custom field value is not defined for fieldName. fieldName = ${fieldName}`;
            return [fieldValue, errMsg];
        }
        if (isFieldValueSelected(fieldValue)) {
            fieldValue = fieldValue.value;
        }
        return [fieldValue, ''];
    }
}

export function newTicketFromForm(call: AppCallRequest): {payload: Tickets.CreatePayload; errors: FieldValidationErrors} {
    const ticket = new TicketFromFormImpl(call);
    const payload = ticket.getTicket();
    const errors = ticket.fieldValidationErrors;
    return {payload, errors};
}
