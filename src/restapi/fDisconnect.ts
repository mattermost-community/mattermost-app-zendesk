import {Request, Response} from 'express';

import {CtxExpandedBotAdminActingUserOauth2User} from '../types/apps';

import {newOKCallResponseWithMarkdown} from '../utils/call_responses';

import {newZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {tryPromiseWithMessage} from '../utils';

export async function fDisconnect(req: Request, res: Response): Promise<void> {
    const context: CtxExpandedBotAdminActingUserOauth2User = req.body.context;
    const zdOptions: ZDClientOptions = {
        oauth2UserAccessToken: context.oauth2.user.access_token,
        botAccessToken: context.bot_access_token,
        mattermostSiteUrl: context.mattermost_site_url,
    };
    const zdClient = await newZDClient(zdOptions);

    // get current token. this request will be recognized as the token coming
    // from the zendesk app
    const oauthReq = zdClient.oauthtokens.current();
    const currentToken = await tryPromiseWithMessage(oauthReq, 'failed to get current user token');

    // get the token ID
    const currentTokenID = currentToken.token.id;

    // delete the user zendesk oauth token
    const deleteReq = zdClient.oauthtokens.revoke(currentTokenID);
    await tryPromiseWithMessage(deleteReq, 'failed to revoke current user token');

    res.json(newOKCallResponseWithMarkdown('You have disconnected your Zendesk account'));
}
