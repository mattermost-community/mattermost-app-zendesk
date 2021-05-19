import {Request, Response} from 'express';

import {newFormCallResponse, newOKCallResponseWithMarkdown, newErrorCallResponseWithMessage} from '../utils/call_responses';
import {newSubscriptionsForm} from '../forms';
import {newApp} from '../app/app';
import {webhookConfigured} from '../utils/utils';
import {newConfigStore} from '../store';

// OpenSubscriptionsForm opens a new subscriptions form
export async function fOpenSubscriptionsForm(req: Request, res: Response): Promise<void> {
    const context = req.body.context;
    const config = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    const cValues = await config.getValues();
    if (!webhookConfigured(cValues)) {
        const msg = 'Subscriptions cannot be created before the Zendesk Target is configured.  Please contact your Mattermost admin.';
        res.json(newOKCallResponseWithMarkdown(msg));
        return;
    }
    try {
        const form = await newSubscriptionsForm(req.body);
        res.json(newFormCallResponse(form));
    } catch (error) {
        res.json(newErrorCallResponseWithMessage('Unable to open subscriptions form: ' + error.message));
    }
}

// SubmitOrUpdateSubscriptionsForm updates the subscriptions form with new values or
// submits the form if submit button is clicked
export async function fSubmitOrUpdateSubscriptionsForm(req: Request, res: Response): Promise<void> {
    try {
        const form = await newSubscriptionsForm(req.body);
        res.json(newFormCallResponse(form));
    } catch (error) {
        res.json(newErrorCallResponseWithMessage('Unable to update subscriptions form: ' + error.message));
    }
}

export async function fSubmitOrUpdateSubscriptionsSubmit(req: Request, res: Response): Promise<void> {
    try {
        const app = newApp(req.body);
        const callResponse = await app.createZDSubscription();
        res.json(callResponse);
    } catch (error) {
        res.json(newErrorCallResponseWithMessage('Unable to create subscription: ' + error.message));
    }
}
