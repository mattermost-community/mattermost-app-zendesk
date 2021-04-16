import {Request, Response} from 'express';

import {newConfigStore} from '../store';
import {newOKCallResponseWithMarkdown} from '../utils/call_responses';

export async function fMe(req: Request, res: Response): Promise<void> {
    const config = await newConfigStore(req.body.context).getValues();
    const zdHost = config.zd_url;
    let message = h4(`[(Zendesk Host)](${zdHost})`);
    message += addBullet('`access_token:` ' + req.body.context.oauth2.user.access_token);
    res.json(newOKCallResponseWithMarkdown(message));
}

function addBullet(text: string): string {
    return `* ${text}\n`;
}

function h4(text: string): string {
    return `#### ${text}\n`;
}
