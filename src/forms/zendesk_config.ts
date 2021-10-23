import {AppCallRequest, AppField, AppForm} from 'mattermost-redux/types/apps';
import {AppFieldTypes} from 'mattermost-redux/constants/apps';
import Client4 from 'mattermost-redux/client/client4.js';

import {ExpandedBotAdminActingUser, ExpandedOauth2App, Oauth2App} from '../types/apps';
import {newMMClient} from '../clients';
import {MMClientOptions} from 'clients/mattermost';
import {Routes} from '../utils';
import {BaseFormFields} from '../utils/base_form_fields';
import {ZendeskIcon} from '../utils/constants';
import {AppConfigStore, ConfigStore, newConfigStore} from '../store/config';

// newZendeskConfigForm returns a form response to configure the zendesk client
export async function newZendeskConfigForm(call: AppCallRequest): Promise<AppForm> {
    const context = call.context as ExpandedBotAdminActingUser;
    const mmOptions: MMClientOptions = {
        mattermostSiteURL: context.mattermost_site_url,
        actingUserAccessToken: context.acting_user_access_token,
        botAccessToken: context.bot_access_token,
        adminAccessToken: context.admin_access_token,
    };
    const mmClient = newMMClient(mmOptions).asActingUser();
    const configStore = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    const formFields = new FormFields(call, configStore, mmClient);
    const fields = await formFields.getConfigFields();

    const form: AppForm = {
        title: 'Configure Zendesk',
        header: 'Configure the Zendesk app with the following information.',
        icon: ZendeskIcon,
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
        super(call, mmClient, undefined);
        const context = call.context as ExpandedOauth2App;
        this.configStore = configStore;
        this.OauthValues = {
            client_id: context.oauth2.client_id,
            client_secret: context.oauth2.client_secret,
        };
        this.storeValues = {
            zd_url: '',
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
            modal_label: 'Client ID',
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
            modal_label: 'Client Secret',
            value: this.OauthValues.client_secret,
            description: 'Client Secret obtained from Zendesk Oauth client secret',
            is_required: true,
        };
        this.builder.addField(f);
    }
}

