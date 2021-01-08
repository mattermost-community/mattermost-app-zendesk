import {Request, Response} from 'express';
import {AppCallResponse} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {newZDClient} from '../clients';
import {tryCallWithMessage, errorWithMessage} from '../utils';

import {oauthStore} from '../store';

export async function fDisconnect(req: Request, res: Response): Promise<void> {
    const context = req.body.context;
    const token = oauthStore.getToken(context.acting_user_id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zdClient = newZDClient(token) as any;

    // get current token. this request will be recognized as the token coming
    // from the zendesk app
    const currentToken = await tryCallWithMessage(zdClient.oauthtokens.current(), 'failed to get current user token');

    // get the token ID
    const currentTokenID = currentToken.token.id;

    // delete the user zendesk oauth token
    await tryCallWithMessage(zdClient.oauthtokens.revoke(currentTokenID), 'failed to revoke current user token');

    // delete the token from the store
    oauthStore.deleteToken(context.acting_user_id);
    const callResponse: AppCallResponse = {
        type: AppCallResponseTypes.OK,
        markdown: 'You have disconnected your Zendesk account',
    };
    res.json(callResponse);
}
