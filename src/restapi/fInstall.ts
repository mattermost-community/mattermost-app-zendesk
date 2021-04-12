import {Request, Response} from 'express';

import {newOKCallResponse} from 'utils/call_responses';

// import {OpenZendeskConfigForm, SubmitOrUpdateZendeskConfigForm} from '../call_handlers';

export async function fInstall(req: Request, res: Response): Promise<void> {
    // const callResponse = await new OpenZendeskConfigForm(req.body).handle();
    // res.json(callResponse);

    // TODO send installer to configuration modal
    // TODO verify configuration is complete after install and before any other
    // usage and allowed bindings
    res.json(newOKCallResponse());
}

