import {Request, Response} from 'express';

import {CtxExpandedBotAdminActingUserOauth2User} from '../types/apps';
import {newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {newZDClient, newAppsClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {tryPromiseWithMessage} from '../utils';
import {ZDTokensResponse} from '../utils/ZDTypes';
import {newConfigStore} from '../store';

export async function fDisconnect(req: Request, res: Response): Promise<void> {
    const context: CtxExpandedBotAdminActingUserOauth2User = req.body.context;
    const zdOptions: ZDClientOptions = {
        oauth2UserAccessToken: context.oauth2.user.token.access_token,
        botAccessToken: context.bot_access_token,
        mattermostSiteUrl: context.mattermost_site_url,
    };

    // get the saved service account config zendesk access_token
    const config = await newConfigStore(context.bot_access_token, context.mattermost_site_url).getValues();
    const configOauthToken = config.zd_oauth_access_token;
    const text = 'This mattermost account is connected via oauth2 to Zendesk for subscription functionality. The account cannot be disconnected until the access token in the configuration is updated to a new user access token.';
    if (context.oauth2.user.token.access_token === configOauthToken) {
        res.json(newOKCallResponseWithMarkdown(text));
        return;
    }

    const zdClient = await newZDClient(zdOptions);
    const oauthReq = zdClient.oauthtokens.list();
    const tokens: ZDTokensResponse = await tryPromiseWithMessage(oauthReq, 'failed to get oauth tokens');

    // get the token ID
    const tokenID = getUserTokenID(zdOptions.oauth2UserAccessToken, tokens);

    // delete the token from the proxy app
    const ppClient = newAppsClient(context.acting_user_access_token, context.mattermost_site_url);
    await ppClient.storeOauth2User({token: {}, is_agent: false});

    // delete the zendesk user oauth token
    const deleteReq = zdClient.oauthtokens.revoke(tokenID);
    await tryPromiseWithMessage(deleteReq, 'failed to revoke acting user token');

    res.json(newOKCallResponseWithMarkdown('You have disconnected your Zendesk account'));
}

// getUserTokenID retrieves the Zendesk tokenID for the acting user
function getUserTokenID(userToken: string, tokens: ZDTokensResponse): number {
    if (!tokens[0] && !tokens[0].tokens) {
        throw new Error('unable get oauth tokens');
    }
    const userTokens = tokens[0].tokens;
    for (const token of userTokens) {
        if (userToken.startsWith(token.token)) {
            return token.id;
        }
    }
    throw new Error('Unable to find token ID for user');
}
