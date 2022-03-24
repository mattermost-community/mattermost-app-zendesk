import {AppCallResponse} from 'types/apps';

import {getBindings} from '../bindings';
import {CtxExpandedActingUserOauth2AppOauth2User} from '../types/apps';
import {CallResponseHandler, newOKCallResponseWithData} from '../utils/call_responses';

export const fBindings: CallResponseHandler = async (req, res) => {
    const context: CtxExpandedActingUserOauth2AppOauth2User = req.body.context;
    const bindings = getBindings(context);
    const callResponse: AppCallResponse = newOKCallResponseWithData(bindings);
    res.json(callResponse);
};
