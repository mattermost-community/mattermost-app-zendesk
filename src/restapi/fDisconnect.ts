import {Request, Response} from 'express';
import {AppCallResponse} from 'mattermost-redux/types/apps';

import {zendesk} from '../clients';
import {ENV} from '../utils';

import {oauth} from '../store';

export async function fDisconnect(req: Request, res: Response): Promise<void> {
    const context = req.body.context;
    const [token, found] = oauth.getToken(context.acting_user_id);

    const zdClient = zendesk.newClient(ENV.zendesk.apiURL, token);

    // get current token. this request will be recognzied as the token coming
    // from the zendesk app
    const currentToken = await zdClient.oauthtokens.current();

    // get the token ID
    const currentTokenID = currentToken.token.id;

    // delete the user zendesk oauth token
    await zdClient.oauthtokens.revoke(currentTokenID);

    // delete the token from the store
    oauth.deleteToken(context.acting_user_id);
    const callResponse: AppCallResponse = {
        type: '',
        markdown: 'You have disconnected your Zendesk account',
    };
    res.json(callResponse);
}
