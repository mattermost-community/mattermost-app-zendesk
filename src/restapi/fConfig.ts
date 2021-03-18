import {Request, Response} from 'express';

import {OpenZendeskConfigForm, SubmitOrUpdateZendeskConfigForm} from '../call_handlers';

export async function fOpenZendeskConfigForm(req: Request, res: Response): Promise<void> {
    const callResponse = await new OpenZendeskConfigForm(req.body).handle();
    res.json(callResponse);
}

export async function fSubmitOrUpdateZendeskConfigForm(req: Request, res: Response): Promise<void> {
    const callResponse = await new SubmitOrUpdateZendeskConfigForm(req.body).handle();
    res.json(callResponse);
}
