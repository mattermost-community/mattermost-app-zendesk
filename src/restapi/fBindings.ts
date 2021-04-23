import {Request, Response} from 'express';

import {getBindings} from '../bindings';
import {CtxExpandedActingUserOauth2AppOauth2User} from '../types/apps';
import {newOKCallResponseWithData} from '../utils/call_responses';

export async function fBindings(req: Request, res: Response): Promise<void> {
    const context: CtxExpandedActingUserOauth2AppOauth2User = req.body.context;
    const bindings = await getBindings(context);
    res.json(newOKCallResponseWithData(bindings));
}
