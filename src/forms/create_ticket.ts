import {Tickets, Users} from 'node-zendesk';

import Client4 from 'mattermost-redux/client/client4.js';

import {AppField, AppForm, AppCallRequest} from 'mattermost-redux/types/apps';
import {AppFieldTypes} from 'mattermost-redux/constants/apps';

import {AppContextWithBot} from 'types/apps';

import {newZDClient, newMMClient, ZDClient} from 'clients';

import {getStaticURL, Routes} from 'utils';
import {makeOptions, makeFormOptions, tryPromiseWithMessage, ZDFormFieldOption, ZDFieldOption} from 'utils/utils';
import {SystemFields, MappedZDNames, ZDFieldTypes, CreateTicketFields, ZendeskIcon} from 'utils/constants';
import {BaseFormFields} from 'utils/base_form_fields';

const omitFields = ['Group', 'Status'];

// newCreateTicketForm returns a form response to create a ticket from a post
export async function newCreateTicketForm(call: AppCallRequest): Promise<AppForm> {
    const context: AppContextWithBot = call.context as AppContextWithBot;
    const zdClient: ZDClient = await newZDClient(context);
    const mmClient = newMMClient(context).asAdmin();
    const formFields = new FormFields(call, zdClient, mmClient);
    const fields = await formFields.getCreateTicketFields();

    const form: AppForm = {
        title: 'Create Zendesk Ticket',
        header: 'Create a Zendesk ticket from Mattermost by filling out and submitting this form. Additional text can be added in the `Optional Message` field.',
        icon: getStaticURL(call.context, ZendeskIcon),
        fields,
        call: {
            path: Routes.App.CallPathTicketSubmitOrUpdateForm,
        },
    };
    return form;
}

// FormFields retrieves viewable modal app fields
class FormFields extends BaseFormFields {
    zdTicketForms: ZDFormFieldOption[]
    postMessage: string
    constructor(call: AppCallRequest, zdClient: ZDClient, mmClient: Client4) {
        super(call, zdClient, mmClient);
        this.postMessage = call?.context?.post?.message as string;
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

        // add fields that are dependant on form selector dropdown being defined
        await this.addFormSelectDependentFields();
    }

    // setState sets state for the current Zendesk Form
    async setState(): Promise<void> {
        const listReq = this.zdClient?.ticketforms.list();
        const zdTicketForms = await tryPromiseWithMessage(listReq, 'Failed to fetch ticket forms');
        this.zdTicketForms = zdTicketForms;
    }

    async addFormSelectDependentFields(): Promise<void> {
        // get the form id from the selected form field value
        const formID = this.builder.getFieldValueByName(CreateTicketFields.NameFormsSelect) as unknown;

        const zdFormFieldIDs = this.getTicketFieldIDs(formID as number);
        const fieldsListReq = this.zdClient?.ticketfields.list();
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
        const ids = forms.find((form: ZDFormFieldOption) => {
            return form.id === id;
        });

        return ids ? ids.ticket_field_ids : [];
    }

    // getViewableFields returns a list of viewable Zendesk field IDs
    private getViewableFields(ticketFields: Users.Fields.UserField[], formIDs: number[]): Tickets.Field[] {
        const fields: Users.Fields.UserField[] = [];
        ticketFields.forEach((field: Users.Fields.UserField) => {
            // omit fields that do not show up in the create ticket modal in Zendesk
            // but are returned in the ticketFields query
            if (omitFields.includes(field.title)) {
                return;
            }

            // only keep fields listed in formIDs
            if (formIDs.includes(field.id as number)) {
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

            const f: AppField = {
                type: '',
                name,
                label,
                is_required: isRequired,
            };

            switch (field.type) {
            case ZDFieldTypes.Description:
                // will be filled by post message and handled separately
                return;

            case ZDFieldTypes.Integer:
            case ZDFieldTypes.Decimal:
            case ZDFieldTypes.Subject:
            case ZDFieldTypes.Text:
            case ZDFieldTypes.MultiLine: {
                f.type = AppFieldTypes.TEXT;
                if (field.type === ZDFieldTypes.MultiLine) {
                    f.subtype = 'textarea';
                }
                this.builder.addField(f);
                return;
            }

            case ZDFieldTypes.Checkbox: {
                f.type = AppFieldTypes.BOOL;
                this.builder.addField(f);
                return;
            }

            case ZDFieldTypes.TicketType:
            case ZDFieldTypes.Priority:
            case ZDFieldTypes.Tagger:
            case ZDFieldTypes.Muliselect: {
                f.type = AppFieldTypes.STATIC_SELECT;
                const options = this.isSystemField(field) ? field.system_field_options : field.custom_field_options;
                f.options = makeOptions(options as ZDFieldOption[]);

                f.multiselect = false;
                if (field.type === ZDFieldTypes.Muliselect) {
                    f.multiselect = true;
                }
                this.builder.addField(f);
                return;
            }
            default:
                console.log('field type not mapped to app field. type =', field.type);
                break;
            }
        });
    }

    isSystemField(field: Users.Fields.UserField): boolean {
        return (SystemFields.includes(String(field.type)) || field.system_field_options) as boolean;
    }

    // getMappedName gets the mapped field name for a zendesk field.
    // custom zendesk field names are prefixed so that it can be easily parsed
    // when form is submitted
    getMappedName(field: Users.Fields.UserField): string {
        const strFieldType = String(field.type);
        if (strFieldType in MappedZDNames) {
            return MappedZDNames[strFieldType];
        }
        if (this.isSystemField(field)) {
            return strFieldType;
        }
        return this.getCustomFieldName(field);
    }

    getCustomFieldName(field: Users.Fields.UserField): string {
        return `${CreateTicketFields.PrefixCustomField}${field.type}_${field.id}`;
    }

    // addFormsToSelectField maps zendesk forms to a Mattermost select field
    addFormsSelectField(): void {
        const f: AppField = {
            name: CreateTicketFields.NameFormsSelect,
            type: AppFieldTypes.STATIC_SELECT,
            label: 'Form',
            options: makeFormOptions(this.zdTicketForms),
            is_required: true,
            refresh: true,
        };
        this.builder.addField(f);
    }

    // addPostFields returns fields for post message and additoinal text fields
    addOptionalMessageField(): void {
        const f: AppField = {
            name: CreateTicketFields.NameAdditionalMessage,
            type: AppFieldTypes.TEXT,
            subtype: 'textarea',
            label: 'Optional message',
            options: makeFormOptions(this.zdTicketForms),
            description: 'Add additional message to the Zendesk ticket',
        };
        this.builder.addField(f);
    }

    addPostMessageField(): void {
        const f: AppField = {
            name: CreateTicketFields.NamePostMessage,
            type: AppFieldTypes.TEXT,
            subtype: 'textarea',
            label: 'Mattermost message',
            value: this.postMessage,
            is_required: true,
            readonly: true,
        };
        this.builder.addField(f);
    }
}

