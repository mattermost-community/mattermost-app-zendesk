import {Request, Response} from 'express';

import {newOKCallResponseWithMarkdown} from '../utils/call_responses';

import {contextFromRequest} from '../utils';

export async function fConnect(req: Request, res: Response): Promise<void> {
    const context = contextFromRequest(req);
    let link = context.mattermost_site_url;
    link += context.app_path;
    link += '/oauth2/remote/redirect';
    res.json(newOKCallResponseWithMarkdown(`Follow this link to connect: [link](${link})`));
}
