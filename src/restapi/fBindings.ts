import {Request, Response} from 'express';

import {CtxWithActingUserExpanded} from 'types/apps';

import {newOKCallResponseWithData} from 'utils/call_responses';

import {getBindings} from 'bindings';

export async function fBindings(req: Request, res: Response): Promise<void> {
    const context: CtxWithActingUserExpanded = req.body.context;
    const bindings = await getBindings(context);
    res.json(newOKCallResponseWithData(bindings));
}
