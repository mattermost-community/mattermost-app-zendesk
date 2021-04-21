import {AppCallRequest, AppField, AppForm} from 'mattermost-redux/types/apps';
import {AppFieldTypes} from 'mattermost-redux/constants/apps';

import Client4 from 'mattermost-redux/client/client4.js';

import {CtxExpandedBotAdminActingUser, CtxExpandedOauth2App, Oauth2App} from '../types/apps';

import {newMMClient, ZDClient} from '../clients';
import {MMClientOptions} from 'clients/mattermost';
import {getStaticURL, Routes} from '../utils';
import {BaseFormFields} from '../utils/base_form_fields';
import {ZendeskIcon} from '../utils/constants';
import {newConfigStore, ConfigStore, AppConfigStore} from '../store/config';

// newZendeskConfigForm returns a form response to configure the zendesk client
export async function newZendeskConfigForm(call: AppCallRequest): Promise<AppForm> {
    const context = call.context as CtxExpandedBotAdminActingUser;
    const mmOptions: MMClientOptions = {
        mattermostSiteURL: context.mattermost_site_url,
        actingUserAccessToken: context.acting_user_access_token,
        botAccessToken: context.bot_access_token,
        adminAccessToken: context.mattermost_site_url,
    };
    const mmClient = newMMClient(mmOptions).asAdmin();
    const configStore = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    const formFields = new FormFields(call, configStore, mmClient);
    const fields = await formFields.getConfigFields();

    const form: AppForm = {
        title: 'Configure Zendesk',
        header: 'Configure the Zendesk app with the following information.',
        icon: getStaticURL(call.context.mattermost_site_url, ZendeskIcon),
        fields,
        call: {
            path: Routes.App.CallPathConfigSubmitOrUpdateForm,
        },
    };
    return form;
}

// FormFields retrieves viewable modal app fields
class FormFields extends BaseFormFields {
    configStore: ConfigStore
    storeValues: AppConfigStore
    OauthValues: Oauth2App

    constructor(call: AppCallRequest, configStore: ConfigStore, mmClient: Client4) {
        super(call, {} as ZDClient, mmClient);
        const context = call.context as CtxExpandedOauth2App;
        this.configStore = configStore;
        this.OauthValues = {
            client_id: context.oauth2.client_id,
            client_secret: context.oauth2.client_secret,
        };
        this.storeValues = {
            zd_url: '',
            zd_node_host: '',
            zd_oauth_access_token: '',
            zd_target_id: '',
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
        this.addZDConnectedUserIDField();
        this.addZDNodeHost();
    }

    addZDUrlField(): void {
        const f: AppField = {
            type: AppFieldTypes.TEXT,
            name: 'zd_url',
            label: 'URL',
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
            label: 'Client ID',
            value: this.OauthValues.client_id,
            description: 'Client ID obtained from Zendesk Oauth client Unique Identifier',
            is_required: true,
        };
        this.builder.addField(f);
    }
    addZDClientSecretField(): void {
        const f: AppField = {
            type: AppFieldTypes.TEXT,
            subtype: 'password',
            name: 'zd_client_secret',
            label: 'Client Secret',
            value: this.OauthValues.client_secret,
            description: 'Client Secret obtained from Zendesk Oauth client secret',
            is_required: true,
        };
        this.builder.addField(f);
    }

    addZDConnectedUserIDField(): void {
        const f: AppField = {
            type: AppFieldTypes.TEXT,
            subtype: 'password',
            name: 'zd_oauth_access_token',
            label: 'Oauth2 Access Token',
            value: this.storeValues.zd_oauth_access_token,
            description: 'Oauth2 Connected Mattermost Account with Zendesk agent access. This field is needed for subscriptions',
        };
        this.builder.addField(f);
    }

    addZDNodeHost(): void {
        const f: AppField = {
            type: AppFieldTypes.TEXT,
            name: 'zd_node_host',
            hint: 'Ex. https://yourhost.ngrok.io',
            label: 'Node Host',
            value: this.storeValues.zd_node_host,
            description: 'Only needed for development',
        };
        this.builder.addField(f);
    }
}

