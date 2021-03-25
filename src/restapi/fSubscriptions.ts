import {Request, Response} from 'express';

import {newFormCallResponse} from '../utils/call_responses';
import {newSubscriptionsForm} from '../forms';
import {newApp} from '../app/app';

// OpenSubscriptionsForm opens a new subscriptions form
export async function fOpenSubscriptionsForm(req: Request, res: Response): Promise<void> {
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
