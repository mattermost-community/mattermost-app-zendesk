import {AppField, AppSelectOption} from 'mattermost-redux/types/apps';

import {AppFieldTypes} from 'mattermost-redux/constants/apps';

// BaseField provides methods for modifying an AppField object
class BaseField {
    protected field: AppField = {}

    constructor(name: string) {
        this.field.name = name;
        this.field.label = '';

        this.field.hint = '';
        this.field.subtype = '';
        this.field.is_required = false;
        this.field.multiselect = false;
        this.field.readonly = false;
        this.field.refresh = false;
    }

    // setType sets the AppField type field
    protected setType(type: string): void {
        this.field.type = type;
    }

    // setOptions sets the AppField options field
    protected setOptions(options: AppSelectOption[]): void {
        this.field.options = options;
    }

    // isMultiselect designates the select field as a multiselect field
    protected isMultiselect(): void {
        this.field.multiselect = true;
    }

    protected setValueTrue(): void {
        this.field.value = true;
    }

    protected setValueFalse(): void {
        this.field.value = false;
    }

    // setDescription sets the description for a field
    setDescription(description: string): void {
        this.field.description = description;
    }

    // setLabel sets the label for a field
    setLabel(label: string): void {
        this.field.label = label;
    }

    // setLabel sets the label for a field
    setHint(hint: string): void {
        this.field.hint = hint;
    }

    // setValue sets value for a field. If this method is used, the
    // value of the field will be initialized with the value provided
    setValue(value: string): void {
        this.field.value = value;
    }

    // isRequired designates the field is required
    isRequired(): void {
        this.field.is_required = true;
    }

    // isRefresh designates that a change in field value will refresh the form
    isRefresh(): void {
        this.field.refresh = true;
    }

    // isReadOnly designates the field is readonly
    isReadOnly(): void {
        this.field.readonly = true;
    }

    // isTextArea the text field will be multilined
    isTextArea(): void {
        this.field.subtype = 'textarea';
    }

    // toAppField() returns the valued AppField type. This is a necessary
    // conversion step if needed in pass the AppField object form of the
    // current field
    toAppField(): AppField {
        return this.field;
    }
}

// Textfield constructs a new AppField of type text field
export class TextField extends BaseField {
    constructor(name: string) {
        super(name);
        super.setType(AppFieldTypes.TEXT);
    }
}

// Boolfield constructs a new AppField of type bool field
export class BoolField extends BaseField {
    constructor(name: string) {
        super(name);
        super.setType(AppFieldTypes.BOOL);
    }

    setTrue(): void {
        super.setValueTrue();
    }

    setFalse(): void {
        super.setValueFalse();
    }
}

// StaticSelectField constructs a new AppField of type static select field
export class StaticSelectField extends BaseField {
    constructor(name: string, options: AppSelectOption[]) {
        super(name);
        this.setType(AppFieldTypes.STATIC_SELECT);
        this.setSelectOptions(options);
    }

    // expose setSelectOptions when user is constructing a Static Select Field
    setSelectOptions(options: AppSelectOption[]): void {
        super.setOptions(options);
    }

    // expose isMultiselect to when user is constructing a Static Select Field
    isMuliselect(): void {
        super.isMultiselect();
    }
}
