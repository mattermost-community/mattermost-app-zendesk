import {Request, Response} from 'express';

import {CreateTicketForm} from '../forms';

export async function fCreateForm(req: Request, res: Response): Promise<void> {
    const form = await new CreateTicketForm(req.body).handle();
    res.json(form);
}
