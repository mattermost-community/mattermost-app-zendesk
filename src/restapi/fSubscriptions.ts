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

    await tryCallResponseWithMessage(
        newSubscriptionsForm(req.body).then((form) => {
            callResponse = newFormCallResponse(form);
            res.json(callResponse);
        }),
        'Unable to open subscriptions form',
        res
    );
};

// fSubmitOrUpdateSubscriptionsForm updates the subscriptions form with new values or submits the form if submit button is clicked
export const fSubmitOrUpdateSubscriptionsForm: CallResponseHandler = async (req, res) => {
    await tryCallResponseWithMessage(
        newSubscriptionsForm(req.body).then((form) => {
            const callResponse = newFormCallResponse(form);
            res.json(callResponse);
        }),
        'Unable to update subscriptions form',
        res
    );
};

export const fSubmitOrUpdateSubscriptionsSubmit: CallResponseHandler = async (req, res) => {
    const app = newApp(req.body);
    await tryCallResponseWithMessage(
        app.createZDSubscription().then((callResponse) => res.json(callResponse)),
        'Unable to create subscription',
        res
    );
};
