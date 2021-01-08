import {Request, Response} from 'express';
import {AppCallResponse} from 'mattermost-redux/types/apps';

import {CreateTicketForm} from '../forms';

export async function fCreateForm(req: Request, res: Response): Promise<void> {
    const callResponse = await new CreateTicketForm(req.body).handle();
    res.json(callResponse);
}
