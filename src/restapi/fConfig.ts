import {AppExpandLevels} from '../constants/apps';

import {AppCallResponse} from 'types/apps';

import {AppCallRequestWithValues, CtxExpandedBotActingUserAccessToken} from '../types/apps';
import {AppConfigStore, newConfigStore} from '../store/config';
import {newAppsClient} from '../clients';
import {newZendeskConfigForm} from '../forms';
import {CallResponseHandler, newErrorCallResponseWithFieldErrors, newErrorCallResponseWithMessage, newFormCallResponse, newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {baseUrlFromContext} from '../utils/utils';
import {Routes} from '../constants/zendesk';

export const expandConfigure = {
    acting_user: AppExpandLevels.EXPAND_SUMMARY,
    acting_user_access_token: AppExpandLevels.EXPAND_ALL,
    oauth2_app: AppExpandLevels.EXPAND_ALL,
    oauth2_user: AppExpandLevels.EXPAND_ALL,
};

// fOpenZendeskConfigForm opens a new configuration form
export const fOpenZendeskConfigForm: CallResponseHandler = async (req, res) => {
    let callResponse: AppCallResponse;
    try {
        const form = await newZendeskConfigForm(req.body);
        callResponse = newFormCallResponse(form);
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open configuration form: ' + error.message);
        res.json(callResponse);
    }
};

export const fSubmitOrUpdateZendeskConfigSubmit: CallResponseHandler = async (req, res) => {
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
        const webhookID = cValues.zd_webhook_id;
        const zdOauth2AccessToken = cValues.zd_oauth_access_token;

        // Using a simple /\/+$/ fails CodeQL check - Polynomial regular expression used on uncontrolled data.
        // The solution is to utilize the negative lookbehind pattern match.
        // Matches when the previous character is not a forward slash, then any number of slashes, and EOL.
        // https://codeql.github.com/codeql-query-help/javascript/js-polynomial-redos/#
        const storeValues = call.values as AppConfigStore;
        storeValues.zd_url = storeValues.zd_url.replace(/\/$|(?<!\/)\/+$/, '');

        try {
            await verifyUrl(storeValues.zd_url);
        } catch (error: any) {
            callResponse = newErrorCallResponseWithFieldErrors({zd_url: error.message});
            res.json(callResponse);
            return;
        }

        storeValues.zd_webhook_id = webhookID;
        storeValues.zd_oauth_access_token = zdOauth2AccessToken;
        await configStore.storeConfigInfo(storeValues);
    } catch (err: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to submit configuration form: ' + err.message);
    }
    res.json(callResponse);
};

const verifyUrl = async (url: string) => {
    const verifyURL = url + Routes.ZD.AccessURI;
    const quotedURL = '`' + verifyURL + '`';
    try {
        const resp = await fetch(verifyURL, {method: 'post'});
        if (!resp.ok) {
            throw new Error(`failed to verify url: ${quotedURL}`);
        }
    } catch (err: any) {
        throw new Error(`failed to fetch url: ${quotedURL}`);
    }
};
