import {Request, Response} from 'express';

import {OpenSubscriptionsForm, SubmitOrUpdateSubscriptionsForm} from '../call_handlers';

export async function fOpenSubscriptionsForm(req: Request, res: Response): Promise<void> {
    const callResponse = await new OpenSubscriptionsForm(req.body).handle();
    res.json(callResponse);
}

export async function fSubmitOrUpdateSubscriptionsForm(req: Request, res: Response): Promise<void> {
    const callResponse = await new SubmitOrUpdateSubscriptionsForm(req.body).handle();
    res.json(callResponse);
}
