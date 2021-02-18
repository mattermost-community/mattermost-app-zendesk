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
        const f = new TextField('zd_url');
        f.setLabel('Zendesk URL');
        f.setValue(this.storeValues.zd_url);
        f.setHint('Ex. https://yourhost.zendesk.com');
        f.setDescription('Base URL of the zendesk account');
        f.isRequired();
        this.builder.addField(f.toAppField());
    }

    addZDClientIDField(): void {
        const f = new TextField('zd_client_id');
        f.setLabel('Zendesk Client ID');
        f.setValue(this.storeValues.zd_client_id);
        f.setDescription('Client ID obtained when setting up Oauth client in zendesk');
        f.isRequired();
        this.builder.addField(f.toAppField());
    }
    addZDClientSecretField(): void {
        const f = new TextField('zd_client_secret');
        f.setLabel('Zendesk Client Secret');
        f.setValue(this.storeValues.zd_client_secret);
        f.setDescription('Client Secret obtained when setting up Oauth client in zendesk');
        f.isRequired();
        this.builder.addField(f.toAppField());
    }

    addZDNodeHost(): void {
        const f = new TextField('zd_node_host');
        f.setHint('Ex. https://yourhost.ngrok.io');
        f.setValue(this.storeValues.zd_node_host);
        f.setLabel('Zendesk Node Host');
        f.setDescription('Only needed for development');
        this.builder.addField(f.toAppField());
    }
}

