import {Request, Response} from 'express';

import {getBindings} from '../bindings';

export function fBindings(req: Request, res: Response): void {
    const userID = req.query.acting_user_id;
    res.json(getBindings(userID));
}

