import {Request, Response} from 'express';
import {AppCallResponse} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {getBindings} from '../bindings';

export function fBindings(req: Request, res: Response): void {
    const userID = req.body.context.acting_user_id;
    const callResponse: AppCallResponse = {
        type: AppCallResponseTypes.OK,
        data: getBindings(userID),
    };
    res.json(callResponse);
}
