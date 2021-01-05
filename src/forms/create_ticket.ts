import {Tickets, Users} from 'node-zendesk';

import Client4 from 'mattermost-redux/client/client4.js';

import {AppCall, AppField, AppForm} from 'mattermost-redux/types/apps';

import {newZDClient, newMMClient, ZDClient} from '../clients';

import {Routes, ZDIcon} from '../utils';
import {makeOptions, makeFormOptions, tryPromiseWithMessage, zdFormFieldOption} from '../utils/utils';
import {SystemFields, MappedZDNames, ZDFieldTypes, CreateTicketFields} from '../utils/constants';
import {TextField, StaticSelectField, BoolField} from '../utils/helper_classes/fields/app_fields';

import {BaseFormFields} from '../utils/base_form_fields';

// newCreateTicketForm returns a form response to create a ticket from a post
export async function newCreateTicketForm(call: AppCall): Promise<AppForm> {
    const zdClient = newZDClient(call.context);
    const mmClient = newMMClient().asAdmin();
    const formFields = new FormFields(call, zdClient, mmClient);
    const fields = await formFields.getCreateTicketFields();

    const form: AppForm = {
        title: 'Create Zendesk Ticket',
        header: 'Create a Zendesk ticket from Mattermost by filling out and submitting this form. Additional text can be added in the `Optional Message` field.',
        icon: ZDIcon,
        fields,
        call: {
            url: Routes.App.CallPathSubmitOrUpdateCreateTicketForm,
        },
    };
    return form;
}

// FormFields retrieves viewable modal app fields
class FormFields extends BaseFormFields {
    zdTicketForms: zdFormFieldOption[]
    postMessage: string
    constructor(call: AppCall, zdClient: ZDClient, mmClient: Client4) {
        super(call, zdClient, mmClient);
        this.postMessage = call.context.post.message;
        this.zdTicketForms = [];
    }

    // getFields returns a list of viewable app fields mapped from Zendesk form fields
    async getCreateTicketFields(): Promise<AppField[]> {
        await this.setState();
        await this.buildFields();
        return this.builder.getFields();
    }

    // buildFields adds fields to list of viewable proxy app fields
    async buildFields(): Promise<void> {
        // show the form selector when intially opening the modal
        this.addFormsSelectField();

        // only show form select field until user selects a form select value
        if (!this.builder.currentFieldValuesAreDefined()) {
            return;
        }

        // add fields that are dependant on form selector pulldown being defined
        await this.addFormSelectDependentFields();
    }

    // setState sets state for the current Zendesk Form
    async setState(): Promise<void> {
        const listReq = this.zdClient.ticketforms.list();
        const zdTicketForms = await tryPromiseWithMessage(listReq, 'Failed to fetch ticket forms');
        this.zdTicketForms = zdTicketForms;
    }

    async addFormSelectDependentFields(): Promise<void> {
        // get the form id from the selected form field value
        const formID = this.builder.getFieldValueByName(CreateTicketFields.NameFormsSelect);

        const zdFormFieldIDs = this.getTicketFieldIDs(formID);
        const fieldsListReq = this.zdClient.ticketfields.list();
        const zdTicketFields = await tryPromiseWithMessage(fieldsListReq, 'Failed to fetch ticket fields');
        const zdViewableFields = this.getViewableFields(zdTicketFields, zdFormFieldIDs);

        this.mapZdFieldsToAppFields(zdViewableFields);

        // append optional message and post message to end of form fields
        this.addOptionalMessageField();
        this.addPostMessageField();
    }

    // getTicketFieldIDs returns the list of all fields in a Zendesk form
    private getTicketFieldIDs(id: number): number[] {
        const forms = this.zdTicketForms;
        const ids = forms.find((form: any) => {
            return form.id.toString() === id;
        });
        return ids.ticket_field_ids;
    }

    // getViewableFields returns a list of viewable Zendesk field IDs
    private getViewableFields(ticketFields: Users.Fields.UserField[], formIDs: number[]): Tickets.Field[] {
        const fields = [];
        ticketFields.forEach((field: Users.Fields.UserField) => {
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

    mapZdFieldsToAppFields(fields: Users.Fields.UserField[]): void {
        fields.forEach((field: Users.Fields.UserField) => {
            const name = this.getMappedName(field);
            const label = field.title;
            const isRequired = Boolean(field.required_in_portal);

            switch (field.type) {
            case ZDFieldTypes.Description:
                // will be filled by post message and handled separately
                return;

            case ZDFieldTypes.Integer:
            case ZDFieldTypes.Decimal:
            case ZDFieldTypes.Subject:
            case ZDFieldTypes.Text:
            case ZDFieldTypes.MultiLine: {
                const f = new TextField(name);
                f.setLabel(label);
                if (isRequired) {
                    f.isRequired();
                }
                if (field.type === ZDFieldTypes.MultiLine) {
                    f.isTextArea();
                }
                this.builder.addField(f.toAppField());
                return;
            }

            case ZDFieldTypes.Checkbox: {
                const f = new BoolField(name);
                f.setLabel(label);
                if (isRequired) {
                    f.isRequired();
                }
                this.builder.addField(f.toAppField());
                return;
            }

            case ZDFieldTypes.TicketType:
            case ZDFieldTypes.Priority:
            case ZDFieldTypes.Tagger:
            case ZDFieldTypes.Muliselect: {
                const options = this.isSystemField(field) ? field.system_field_options : field.custom_field_options;
                const f = new StaticSelectField(name, makeOptions(options));
                f.setLabel(label);
                if (isRequired) {
                    f.isRequired();
                }
                if (field.type === ZDFieldTypes.Muliselect) {
                    f.isMuliselect();
                }
                this.builder.addField(f.toAppField());
                return;
            }
            default:
                console.log('field type not mapped to app field. type =', field.type);
                break;
            }
        });
    }

    isSystemField(field: Users.Fields.UserField): boolean {
        return (SystemFields.includes(String(field.type)) || field.system_field_options);
    }

    // getMappedName gets the mapped field name for a zendesk field.
    // custom zendesk field names are prefixed so that it can be easily parsed
    // when form is submitted
    getMappedName(field: Users.Fields.UserField): string {
        const strFieldType = String(field.type);
        switch (true) {
        case strFieldType in MappedZDNames:
            return MappedZDNames[strFieldType];
        case this.isSystemField(field):
            return strFieldType;
        default :
        }
        return this.getCustomFieldName(field);
    }

    getCustomFieldName(field: Users.Fields.UserField): string {
        return CreateTicketFields.PrefixCustomField + `${field.type}_` + field.id;
    }

    // addFormsToSelectField maps zendesk forms to a Mattermost select field
    addFormsSelectField(): void {
        const field = new StaticSelectField(CreateTicketFields.NameFormsSelect, makeFormOptions(this.zdTicketForms));
        field.setLabel('Form');
        field.isRequired();
        field.isRefresh();
        this.builder.addField(field.toAppField());
    }

    // addPostFields returns fields for post message and additoinal text fields
    addOptionalMessageField(): void {
        const field = new TextField(CreateTicketFields.NameAdditionalMessage);
        field.setLabel('Optional message');
        field.setDescription('Add additional message to the Zendesk ticket');
        field.isTextArea();
        this.builder.addField(field.toAppField());
    }

    addPostMessageField(): void {
        const field = new TextField(CreateTicketFields.NamePostMessage);
        field.setLabel('Mattermost message');
        field.setValue(this.postMessage);
        field.isTextArea();
        field.isReadOnly();
        field.isRequired();
        this.builder.addField(field.toAppField());
    }
}

