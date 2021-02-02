import {Request, Response} from 'express';

import {OpenCreateTicketForm} from '../forms';

export async function fOpenCreateTicketForm(req: Request, res: Response): Promise<void> {
    const callResponse = await new OpenCreateTicketForm(req.body).handle();
    res.json(callResponse);
}
