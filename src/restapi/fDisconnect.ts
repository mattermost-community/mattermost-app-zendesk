import {Request, Response} from 'express';

import {newOKCallResponseWithMarkdown} from '../utils/call_responses';

import {newZDClient} from '../clients';
import {tryPromiseWithMessage} from '../utils';

import {oauthStore} from '../store';

export async function fDisconnect(req: Request, res: Response): Promise<void> {
    const context = req.body.context;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zdClient = newZDClient(context);

    // get current token. this request will be recognized as the token coming
    // from the zendesk app
    const oauthReq = zdClient.oauthtokens.current();
    const currentToken = await tryPromiseWithMessage(oauthReq, 'failed to get current user token');

    // get the token ID
    const currentTokenID = currentToken.token.id;

    // delete the user zendesk oauth token
    const deleteReq = zdClient.oauthtokens.revoke(currentTokenID);
    await tryPromiseWithMessage(deleteReq, 'failed to revoke current user token');

    // delete the token from the store
    oauthStore.deleteToken(context.acting_user_id);
    res.json(newOKCallResponseWithMarkdown('You have disconnected your Zendesk account'));
}
