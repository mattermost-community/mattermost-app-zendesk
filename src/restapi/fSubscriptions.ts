import {AppCallResponse} from 'mattermost-redux/types/apps';

import {CallResponseHandler, newErrorCallResponseWithMessage, newFormCallResponse, newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {newSubscriptionsForm} from '../forms';
import {newApp} from '../app/app';
import {tryCallResponseWithMessage, webhookConfigured} from '../utils/utils';
import {newConfigStore} from '../store';

// fOpenSubscriptionsForm opens a new subscriptions form
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

    const form = await tryCallResponseWithMessage(
        newSubscriptionsForm(req.body),
        'Unable to open subscriptions form',
        res
    );
    callResponse = newFormCallResponse(form);
    res.json(callResponse);
};

// fSubmitOrUpdateSubscriptionsForm updates the subscriptions form with new values or submits the form if submit button is clicked
export const fSubmitOrUpdateSubscriptionsForm: CallResponseHandler = async (req, res) => {
    const form = await tryCallResponseWithMessage(
        newSubscriptionsForm(req.body),
        'Unable to update subscriptions form',
        res
    );
    const callResponse = newFormCallResponse(form);
    res.json(callResponse);
};

export const fSubmitOrUpdateSubscriptionsSubmit: CallResponseHandler = async (req, res) => {
    const app = newApp(req.body);
    const callResponse = await tryCallResponseWithMessage(
        app.createZDSubscription(),
        'Unable to create subscription',
        res
    );
    res.json(callResponse);
};
