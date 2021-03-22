import {Request, Response} from 'express';

import {newOKCallResponseWithData} from '../utils/call_responses';

import {getBindings} from '../bindings';
import {contextFromRequest} from '../utils';

export async function fBindings(req: Request, res: Response): Promise<void> {
    const context = contextFromRequest(req);
    const bindings = await getBindings(context);
    res.json(newOKCallResponseWithData(bindings));
}
