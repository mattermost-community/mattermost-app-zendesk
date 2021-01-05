import {Request, Response} from 'express';

import {OpenCreateTicketForm, SubmitOrUpdateCreateTicketForm} from '../call_handlers';

export async function fOpenCreateTicketForm(req: Request, res: Response): Promise<void> {
    const callResponse = await new OpenCreateTicketForm(req.body).handle();
    res.json(callResponse);
}

export async function fSubmitOrUpdateCreateTicketForm(req: Request, res: Response): Promise<void> {
    const callResponse = await new SubmitOrUpdateCreateTicketForm(req.body).handle();
    res.json(callResponse);
}
