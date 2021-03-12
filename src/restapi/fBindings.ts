import {Request, Response} from 'express';

import {newOKCallResponseWithData} from '../utils/call_responses';

import {getBindings} from '../bindings';

export function fBindings(req: Request, res: Response): void {
    const userID = req.body.context.acting_user_id;
    const bindings = getBindings(userID);
    res.json(newOKCallResponseWithData(bindings));
}
