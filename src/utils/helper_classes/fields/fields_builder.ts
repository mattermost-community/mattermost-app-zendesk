import {AppCall, AppField, AppCallValues} from 'mattermost-redux/types/apps';
import {AppFieldTypes} from 'mattermost-redux/constants/apps';

export interface Builder {
    addField(field: AppField): void;
    addFields(field: AppField[]): void;
    currentFieldValuesAreDefined(): boolean;
    getFields(): AppField[];
    getFieldValueByName(fieldName: string): string;
    getFieldLabelByName(fieldName: string): string;
    setDefaultMaxLength(value: number): void;
    setDefaultMinLength(value: number): void;
}

export function newFieldsBuilder(call: AppCall): Builder {
    return new FieldsBuilder(call);
}

// FieldBuilder provides methods to interact with App Fields. Fields can be
// added, retrieved, values checked, and defaults set via this class
class FieldsBuilder implements Builder {
    private values: AppCallValues
    private appFields: AppField[];
    private defaultMaxLength: number;
    private defaultMinLength: number;
    constructor(call: AppCall) {
        this.values = call.values;
        this.appFields = [];
        this.defaultMaxLength = 1024;
        this.defaultMinLength = 2;
    }

    // getSavedValue returns the defined AppCall value for a field or an empty string.
    // This value can be either a single value or an object in the case of a select field
    getSavedValue(fieldName: string): string {
        if (this.values && this.values.values[fieldName]) {
            return this.values.values[fieldName];
        }
        return '';
    }

    // addField adds a field to the array of fields
    addField(f: AppField): void {
        let value = f.value || this.getSavedValue(f.name);
        if (f.type === AppFieldTypes.BOOL) {
            value = true;
            if (f.value === 'false') {
                value = false;
            }
        }

        const field: AppField = {
            name: f.name,
            label: f.label,
            type: f.type,
            hint: f.hint,
            subtype: f.subtype,
            options: f.options,
            multiselect: f.multiselect,
            description: f.description,
            min_length: f.min_length || this.defaultMinLength,
            max_length: f.max_length || this.defaultMaxLength,
            refresh: f.refresh,
            is_required: f.is_required,

            // if field is provided by caller, use that value
            value,
        };

        this.addFieldToArray(field);
    }

    // sets the default max allowable text length at the form level
    setDefaultMaxLength(length: number): void {
        this.defaultMaxLength = length;
    }

    // sets the default min alloweable text length at the form level
    setDefaultMinLength(length: number): void {
        this.defaultMinLength = length;
    }

    // addField adds a field to the current fields list array. Order of fields shown in the modal
    // are the order of fields in the array
    addFieldToArray(field: AppField): void {
        this.appFields.push(field);
    }

    // addFields adds multiple fields to the current fields list array.
    addFields(fields: AppField[]): void{
        this.appFields.push(...fields);
    }

    // getFieldValueByName returns the defined AppCall value for a field or an empty string
    // this is a helper function for a caller to check the value of an
    // AppField. The return value is the value of the field. In the case of a
    // select field, it is the value field in the returned object.
    getFieldValueByName(fieldName: string): string {
        if (this.values && this.values.values[fieldName]) {
            // this is select field return the value field in the object
            if (this.values.values[fieldName].value) {
                return this.values.values[fieldName].value;
            }

            // this is any field type that doesn't have an option type value
            return this.values.values[fieldName];
        }
        return '';
    }

    // getFieldLabelByName returns the defined AppCall label for a field or an empty string
    // this is a helper function for a caller to check the value of an
    // AppField. The return value is the value of the field. In the case of a
    // select field, it is the value field in the returned object.
    getFieldLabelByName(fieldName: string): string {
        if (this.values && this.values.values[fieldName]) {
            // this is select field return the value field in the object
            if (this.values.values[fieldName].label) {
                return this.values.values[fieldName].label;
            }

            // this is any field type that doesn't have an option type value
            return this.values.values[fieldName];
        }
        return '';
    }

    // getFields returns an array of currently mapped fields saved in the mapper
    getFields(): AppField[] {
        return this.appFields;
    }

    // currentFieldValuesSelected returns true if all fields in
    // this.appFields have a value and are not empty.  Used for dependency convenience check
    // while populating the appFields in a form. If values currently defined
    // are not empty, continue getting other fields.  Otherwise return the
    // currect list of fields
    currentFieldValuesAreDefined(): boolean {
        for (const field of this.appFields) {
            if (!this.isFieldValueSelected(field)) {
                return false;
            }
        }
        return true;
    }

    // isFieldValueSelected checks if the AppField has a defined value
    isFieldValueSelected(field: AppField): boolean {
        return Boolean(field.value);
    }
}
