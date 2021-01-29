import {UserField} from 'node-zendesk';
import {AppCall, AppField, AppCallValues} from 'mattermost-redux/types/apps';

import {AppFieldTypes} from 'mattermost-redux/constants/apps';

import {ZDFieldTypes, SystemFields, AppFieldNames, MappedZDNames, makeFormOptions, makeOptions, FormTextAreaMaxLength} from '../utils';

interface Imapper {
    mapZdFieldsToAppFields(fields: UserField[]): AppField[];
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
    mapZdFieldsToAppFields(fields: UserField[]): AppField[] {
        const appFields: AppField[] = [];
        fields.forEach((field) => {
            switch (field.type) {
            case ZDFieldTypes.Description:
                // will be filled by post message and handled separately
                return;

            case ZDFieldTypes.Integer:
            case ZDFieldTypes.Decimal:
                appFields.push(this.mapToText(field));
                return;

            case ZDFieldTypes.Subject:
            case ZDFieldTypes.Text:
            case ZDFieldTypes.MultiLine:
                appFields.push(this.mapToText(field));
                return;

            case ZDFieldTypes.Checkbox:
                appFields.push(this.mapToBool(field));
                return;

            case ZDFieldTypes.TicketType:
            case ZDFieldTypes.Priority:
            case ZDFieldTypes.Tagger:
            case ZDFieldTypes.Muliselect:
                appFields.push(this.mapToStaticSelect(field));
                return;

            default:
                console.log('field type not mapped to app field. type =', field.type);
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
        const name = AppFieldNames.FormsSelectName;
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
        const multiselect = field.type === ZDFieldTypes.Muliselect;
        const selectField: AppField = {
            name,
            label: field.title,
            type: AppFieldTypes.STATIC_SELECT,
            options: makeOptions(options),
            multiselect,
            is_required: field.required_in_portal,
            value: this.getSavedValue(name),
        };
        return selectField;
    }

    // mapToText maps Zendesk text field types to the Mattermost Text field
    private mapToText(field: UserField): AppField {
        // multi-line zd fields have type textarea
        let subType = '';
        if (field.type === ZDFieldTypes.MultiLine) {
            subType = ZDFieldTypes.MultiLine;
        }

        // There is no distinguishable difference in a custom text field and
        // a system text field such as subject
        const name = this.getMappedName(field);
        const textField: AppField = {
            name,
            label: field.title,
            type: AppFieldTypes.TEXT,
            min_length: 2,
            max_length: FormTextAreaMaxLength,
            subtype: subType,
            is_required: field.required_in_portal,
            value: this.getSavedValue(name),
        };
        return textField;
    }

    private isSystemField(field: UserField): boolean {
        if (SystemFields.includes(field.type) || field.system_field_options) {
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
                name: AppFieldNames.AdditionalMessage,
                label: 'Optional message',
                type: AppFieldTypes.TEXT,
                description: 'Add additional message to the Zendesk ticket',
                subtype: 'textarea',
                value: this.getSavedValue(AppFieldNames.AdditionalMessage),
                min_length: 2,
                max_length: FormTextAreaMaxLength,
            },
            {
                name: AppFieldNames.PostMessage,
                label: 'Mattermost message',
                type: AppFieldTypes.TEXT,
                value: postMessage,
                subtype: 'textarea',
                readonly: true,
                min_length: 2,
                max_length: FormTextAreaMaxLength,
                is_required: true,
            },
        ];
    }

    // getMappedName gets the mapped field name for a zendesk field.
    // custom zendesk field names are prefixed so that it can be easily parsed
    // when form is submitted
    private getMappedName(field: UserField): string {
        switch (true) {
        case field.type in MappedZDNames:
            return MappedZDNames[field.type];
        case this.isSystemField(field):
            return field.type;
        default :
        }
        return this.getCustomFieldName(field);
    }

    private getCustomFieldName(field: UserField): string {
        return AppFieldNames.CustomFieldPrefix + `${field.type}_` + field.id;
    }
}
