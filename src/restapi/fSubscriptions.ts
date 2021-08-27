import {AppCallResponse} from 'mattermost-redux/types/apps';

import {newFormCallResponse, newOKCallResponseWithMarkdown, newErrorCallResponseWithMessage, CallResponseHandler} from '../utils/call_responses';
import {newSubscriptionsForm} from '../forms';
import {newApp} from '../app/app';
import {webhookConfigured} from '../utils/utils';
import {newConfigStore} from '../store';

// OpenSubscriptionsForm opens a new subscriptions form
export const fOpenSubscriptionsForm: CallResponseHandler = async (req, res) => {
    const context = req.body.context;
    const config = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    const cValues = await config.getValues();
    let callResponse: AppCallResponse;
    if (!webhookConfigured(cValues)) {
        const msg = 'Subscriptions cannot be created before the Zendesk Target is configured.  If you are a Mattermost Admin, you can setup the target by running `/zendesk setup-target`.';
        callResponse = newOKCallResponseWithMarkdown(msg);
        res.json(callResponse);
        return;
    }

    try {
        const form = await newSubscriptionsForm(req.body);
        callResponse = newFormCallResponse(form);
        res.json(callResponse);
    } catch (error) {
        callResponse = newErrorCallResponseWithMessage('Unable to open subscriptions form: ' + error.message);
        res.json(callResponse);
    }
};

// SubmitOrUpdateSubscriptionsForm updates the subscriptions form with new values or
// submits the form if submit button is clicked
export const fSubmitOrUpdateSubscriptionsForm: CallResponseHandler = async (req, res) => {
    let callResponse: AppCallResponse;
    try {
        const form = await newSubscriptionsForm(req.body);
        callResponse = newFormCallResponse(form);
        res.json(callResponse);
    } catch (error) {
        callResponse = newErrorCallResponseWithMessage('Unable to update subscriptions form: ' + error.message);
        res.json(callResponse);
    }
};

export const fSubmitOrUpdateSubscriptionsSubmit: CallResponseHandler = async (req, res) => {
    let callResponse: AppCallResponse;
    try {
        const app = newApp(req.body);
        callResponse = await app.createZDSubscription();
        res.json(callResponse);
    } catch (error) {
        callResponse = newErrorCallResponseWithMessage('Unable to create subscription: ' + error.message);
        res.json(callResponse);
    }
};
