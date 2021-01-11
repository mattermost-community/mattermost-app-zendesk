import {Request, Response} from 'express';
import {AppCallResponse} from 'mattermost-redux/types/apps';

import {zd} from '../clients';
import {errorWithMessage} from '../utils';

import {oauthStore} from '../store';

export async function fDisconnect(req: Request, res: Response): Promise<void> {
    const context = req.body.context;
    const token = oauthStore.getToken(context.acting_user_id);

    const zdClient = zd.newClient(token);

    // get current token. this request will be recognized as the token coming
    // from the zendesk app
    let currentToken: Promise<Response>;
    try {
        currentToken = await zdClient.oauthtokens.current();
    } catch (err) {
        throw new Error(errorWithMessage(err, 'failed to get current user token'));
    }

    // get the token ID
    const currentTokenID = currentToken.token.id;

    // delete the user zendesk oauth token
    try {
        await zdClient.oauthtokens.revoke(currentTokenID);
    } catch (err) {
        throw new Error(errorWithMessage(err, 'failed to revoke current user token'));
    }

    // delete the token from the store
    oauthStore.deleteToken(context.acting_user_id);
    const callResponse: AppCallResponse = {
        type: '',
        markdown: 'You have disconnected your Zendesk account',
    };
    res.json(callResponse);
}
