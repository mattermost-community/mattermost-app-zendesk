import {Request, Response} from 'express';

import {newOKCallResponseWithMarkdown} from '../utils/call_responses';

export async function fMe(req: Request, res: Response): Promise<void> {
    const message = '`access_token:` ' + req.body.context.oauth2.user.token.access_token;
    res.json(newOKCallResponseWithMarkdown(message));
}

