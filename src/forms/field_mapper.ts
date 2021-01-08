import {UserField} from 'node-zendesk';
import {AppCall, AppField, AppCallValues} from 'mattermost-redux/types/apps';

import {AppFieldTypes} from 'mattermost-redux/constants/apps';

import {zdTypes, systemFields, fieldNames, mappedZDNames, makeFormOptions, makeOptions, formTextAreaMaxLength} from '../utils';

interface Imapper {
    mapFieldsToAppFields(fields: UserField[]): AppField[];
    mapFormsToSelectField(forms: any): AppField;
}

// FieldMapper maps Zendesk fields to App fields
export class FieldMapper implements Imapper {
    private values: AppCallValues
    private postMessage: string
    constructor(call: AppCall) {
        this.values = call.values;
        this.postMessage = call.context.post.message;
    }
    mapFieldsToAppFields(fields: UserField[]): AppField[] {
        const appFields: AppField[] = [];
        fields.forEach((field) => {
            switch (field.type) {

            // will be filled by post message and handled separately
            case zdTypes.zdTypeDescription:
                return;

            case zdTypes.zdTypeSubject:
            case zdTypes.zdTypeText:
            case zdTypes.zdTypeMultiLine:
                appFields.push(this.mapToText(field));
                return;

            case zdTypes.zdTypeCheckbox:
                appFields.push(this.mapToBool(field));
                return;

            case zdTypes.zdTypeTicketType:
            case zdTypes.zdTypePriority:
            case zdTypes.zdTypeTagger:
                appFields.push(this.mapToStaticSelect(field));

            default:
                console.log('field not mapped to app field. field = ', field);
                break;
            }
        });

        // append optional message and post message to end of form fields
        const postFields = this.getPostFields(this.postMessage);
        appFields.push(...postFields);

        return appFields;
    }

    // mapFormsToSelectField maps zendesk forms to a Mattermost select field
    mapFormsToSelectField(forms: any): AppField {
        const name = fieldNames.formsSelectName;
        const selectField: AppField = {
            name,
            label: 'Form',
            type: AppFieldTypes.STATIC_SELECT,
            options: makeFormOptions(forms),
            value: this.getSavedValue(name),
            is_required: true,
            refresh: true,
        };
        return selectField;
    }

    // mapToBool maps Zendesk checkbox field types to the Mattermost bool field
    private mapToBool(field: UserField): AppField {
        const name = this.getMappedName(field);
        const boolField: AppField = {
            name,
            label: field.title,
            type: AppFieldTypes.BOOL,
            is_required: field.required_in_portal,
            value: this.getSavedValue(name),
        };
        return boolField;
    }

    // mapToStaticSelect maps Zendesk field types to the Mattermost static select field
    private mapToStaticSelect(field: UserField): AppField {
        const name = this.getMappedName(field);
        const options = this.isSystemField(field) ? field.system_field_options : field.custom_field_options;

        const selectField: AppField = {
            name,
            label: field.title,
            type: AppFieldTypes.STATIC_SELECT,
            options: makeOptions(options),
            is_required: field.required_in_portal,
            value: this.getSavedValue(name),
        };
        return selectField;
    }

    // mapToText maps Zendesk text field types to the Mattermost Text field
    private mapToText(field: UserField): AppField {
        // multi-line zd fields have type textarea
        let subType = '';
        if (field.type === zdTypes.zdTypeMultiLine) {
            subType = zdTypes.zdTypeMultiLine;
        }

        // There is no distinguishable difference in a custom text field and
        // a system text field such as subject
        const name = this.getMappedName(field);
        const textField: AppField = {
            name,
            label: field.title,
            type: AppFieldTypes.TEXT,
            min_length: 2,
            max_length: formTextAreaMaxLength,
            subtype: subType,
            is_required: field.required_in_portal,
            value: this.getSavedValue(name),
        };
        return textField;
    }

    private isSystemField(field: UserField): boolean {
        if (field.type === zdTypes.zdTypeCheckbox) {
            return false;
        }

        if (systemFields.includes(field.type) || field.system_field_options) {
            return true;
        }
        return false;
    }

    // getSavedValue returns the defined AppCall value for a field or an empty
    // string
    private getSavedValue(fieldName: string): string {
        if (this.values && this.values.values[fieldName]) {
            return this.values.values[fieldName];
        }
        return '';
    }

    // getPostFields returns fields for post message and additonal text fields
    private getPostFields(postMessage: string): AppField[] {
        return [
            {
                name: fieldNames.additionalMessage,
                label: 'Optional message',
                type: AppFieldTypes.TEXT,
                description: 'Add additional message to the Zendesk ticket',
                subtype: 'textarea',
                value: this.getSavedValue(fieldNames.additionalMessage),
                min_length: 2,
                max_length: formTextAreaMaxLength,
            },
            {
                name: fieldNames.postMessage,
                label: 'Mattermost message',
                type: AppFieldTypes.TEXT,
                value: postMessage,
                subtype: 'textarea',
                readonly: true,
                min_length: 2,
                max_length: formTextAreaMaxLength,
                is_required: true,
            },
        ];
    }

    // getMappedName gets the mapped field name for a zendesk field.
    // custom zendesk field names are prefixed so that it can be easily parsed
    // when form is submitted
    private getMappedName(field: UserField): string {
        switch (true) {
        case mappedZDNames[field.type]:
            return mappedZDNames[field.type];
        case this.isSystemField(field):
            return field.type;
        default :
        }
        return fieldNames.customPrefix + field.id;
    }
}
