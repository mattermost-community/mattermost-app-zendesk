import {Request, Response} from 'express';

import {AppContext} from 'mattermost-redux/types/apps';

import {newOKCallResponseWithData} from '../utils/call_responses';

import {getBindings} from '../bindings';

export async function fBindings(req: Request, res: Response): Promise<void> {
    const context: AppContext = req.body.context;
    const bindings = await getBindings(context);
    res.json(newOKCallResponseWithData(bindings));
}
