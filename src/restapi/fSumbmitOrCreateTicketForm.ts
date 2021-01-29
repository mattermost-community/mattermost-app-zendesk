import {Request, Response} from 'express';

import {SubmitOrUpdateCreateTicketForm} from '../forms';

export async function fSubmitOrUpdateCreateTicketForm(req: Request, res: Response): Promise<void> {
    const callResponse = await new SubmitOrUpdateCreateTicketForm(req.body).handle();
    res.json(callResponse);
}
