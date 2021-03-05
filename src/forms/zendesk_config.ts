import {AppCall, AppField, AppForm} from 'mattermost-redux/types/apps';
import Client4 from 'mattermost-redux/client/client4.js';

import {newMMClient, ZDClient} from '../clients';

import {Routes, ZDIcon} from '../utils';
import {TextField} from '../utils/helper_classes/fields/app_fields';

import {BaseFormFields} from '../utils/base_form_fields';
import {newConfigStore, ConfigStore, AppConfigStore} from '../store/config';

// newZendeskConfigForm returns a form response to configure the zendesk client
export async function newZendeskConfigForm(call: AppCall): Promise<AppForm> {
    const mmClient = newMMClient(call.context).asAdmin();
    const configStore = newConfigStore(call.context);
    const formFields = new FormFields(call, configStore, '', mmClient);
    const fields = await formFields.getConfigFields();

    const form: AppForm = {
        title: 'Configure Zendesk',
        header: 'Configure the Zendesk app with the following information.',
        icon: ZDIcon,
        fields,
        call: {
            url: Routes.App.CallPathSubmitOrUpdateZendeskConfigForm,
        },
    };
    return form;
}

// FormFields retrieves viewable modal app fields
class FormFields extends BaseFormFields {
    configStore: ConfigStore
    storeValues: AppConfigStore

    constructor(call: AppCall, configStore: ConfigStore, zdClient: ZDClient, mmClient: Client4) {
        super(call, zdClient, mmClient);
        this.configStore = configStore;
        this.storeValues = {
            zd_url: '',
            zd_client_id: '',
            zd_client_secret: '',
            zd_node_host: '',
        };
    }

    // getFields returns a list of viewable app fields mapped from Zendesk form fields
    async getConfigFields(): Promise<AppField[]> {
        await this.buildFields();
        return this.builder.getFields();
    }

    // buildFields adds fields to list of viewable proxy app fields
    async buildFields(): Promise<void> {
        this.storeValues = await this.configStore.getValues();
        this.addZDUrlField();
        this.addZDClientIDField();
        this.addZDClientSecretField();
        this.addZDNodeHost();
    }

    addZDUrlField(): void {
        const f: AppField = {
            type: AppFieldTypes.TEXT,
            name: 'zd_url',
            label: 'Zendesk URL',
            value: this.storeValues.zd_url,
            hint: 'Ex. https://yourhost.zendesk.com',
            description: 'Base URL of the zendesk account',
            is_required: true,
        };
        this.builder.addField(f);
    }

    addZDClientIDField(): void {
        const f: AppField = {
            type: AppFieldTypes.TEXT,
            name: 'zd_client_id',
            label: 'Zendesk Client ID',
            value: this.storeValues.zd_client_id,
            description: 'Client ID obtained when setting up Oauth client in zendesk',
            is_required: true,
        };
        this.builder.addField(f);
    }
    addZDClientSecretField(): void {
        const f: AppField = {
            type: AppFieldTypes.TEXT,
            name: 'zd_client_secret',
            label: 'Zendesk Client Secret',
            value: this.storeValues.zd_client_secret,
            description: 'Client Secret obtained when setting up Oauth client in zendesk',
            is_required: true,
        };
        this.builder.addField(f);
    }

    addZDNodeHost(): void {
        const f: AppField = {
            type: AppFieldTypes.TEXT,
            name: 'zd_node_host',
            hint: 'Ex. https://yourhost.ngrok.io',
            label: 'Zendesk Node Host',
            value: this.storeValues.zd_node_host,
            description: 'Only needed for development',
        };
        this.builder.addField(f);
    }
}

