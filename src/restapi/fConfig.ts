import {Request, Response} from 'express';
import {AppCallResponse} from 'mattermost-redux/types/apps';

import {AppCallRequestWithValues, CtxExpandedBotActingUserAccessToken} from '../types/apps';
import {newConfigStore, AppConfigStore} from '../store/config';
import {newAppsClient} from '../clients';
import {newZendeskConfigForm} from '../forms';
import {newOKCallResponseWithMarkdown, newFormCallResponse, newErrorCallResponseWithMessage} from '../utils/call_responses';
import {baseUrlFromContext} from '../utils/utils';

// fOpenZendeskConfigForm opens a new configuration form
export async function fOpenZendeskConfigForm(req: Request, res: Response): Promise<void> {
    try {
        const form = await newZendeskConfigForm(req.body);
        res.json(newFormCallResponse(form));
    } catch (error) {
        res.json(newErrorCallResponseWithMessage('Unable to open configuration form: ' + error.message));
    }
}

export async function fSubmitOrUpdateZendeskConfigSubmit(req: Request, res: Response): Promise<void> {
    const call: AppCallRequestWithValues = req.body;
    const context = call.context as CtxExpandedBotActingUserAccessToken;
    const url = baseUrlFromContext(call.context.mattermost_site_url);
    const id = call.values.zd_client_id || '';
    const secret = call.values.zd_client_secret || '';

    let callResponse: AppCallResponse = newOKCallResponseWithMarkdown('Successfully updated Zendesk configuration');
    try {
        const ppClient = newAppsClient(context.acting_user_access_token, url);
        await ppClient.storeOauth2App(id, secret);

        const configStore = newConfigStore(context.bot_access_token, context.mattermost_site_url);
        const cValues = await configStore.getValues();
        const targetID = cValues.zd_target_id;
        const zdOauth2AccessToken = cValues.zd_oauth_access_token;
        const storeValues = call.values as AppConfigStore;
        storeValues.zd_url = storeValues.zd_url.replace(/\/$/, '');
        storeValues.zd_target_id = targetID;
        storeValues.zd_oauth_access_token = zdOauth2AccessToken;
        await configStore.storeConfigInfo(storeValues);
    } catch (err) {
        callResponse = newErrorCallResponseWithMessage('Unable to submit configuration form: ' + err.message);
    }
    res.json(callResponse);
}
