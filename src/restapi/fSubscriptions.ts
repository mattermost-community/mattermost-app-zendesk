import {Request, Response} from 'express';

import {newFormCallResponse, newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {webhookConfigured} from '../utils/utils';
import {newSubscriptionsForm} from '../forms';
import {newApp} from '../app/app';
import {newConfigStore} from '../store';

// OpenSubscriptionsForm opens a new subscriptions form
export async function fOpenSubscriptionsForm(req: Request, res: Response): Promise<void> {
    const config = await newConfigStore(req.body.context).getValues();
    if (!webhookConfigured(config)) {
        const msg = 'Subscriptions cannot be created before the Zendesk Target is configured.  Please contact your Mattermost admin.';
        res.json(newOKCallResponseWithMarkdown(msg));
        return;
    }

    const form = await newSubscriptionsForm(req.body);
    const callResponse = newFormCallResponse(form);
    res.json(callResponse);
}

// SubmitOrUpdateSubscriptionsForm updates the subscriptions form with new values or
// submits the form if submit button is clicked
export async function fSubmitOrUpdateSubscriptionsForm(req: Request, res: Response): Promise<void> {
    const form = await newSubscriptionsForm(req.body);
    const callResponse = newFormCallResponse(form);
    res.json(callResponse);
}

export async function fSubmitOrUpdateSubscriptionsSubmit(req: Request, res: Response): Promise<void> {
    const app = newApp(req.body);
    const callResponse = await app.createZDSubscription();
    res.json(callResponse);
}
