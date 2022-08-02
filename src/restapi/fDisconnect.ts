import {AppExpandLevels} from '../constants/apps';

import {AppCallResponse} from 'types/apps';

import {CtxExpandedBotActingUserOauth2User} from '../types/apps';
import {CallResponseHandler, newErrorCallResponseWithMessage, newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {newAppsClient, newZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk/types';
import {ZDTokensResponse} from '../types/zendesk';
import {AppConfigStore, newConfigStore} from '../store/config';

export const expandDisconnect = {
    acting_user_access_token: AppExpandLevels.EXPAND_ALL,
    oauth2_app: AppExpandLevels.EXPAND_ALL,
    oauth2_user: AppExpandLevels.EXPAND_ALL,
};

export const fDisconnect:CallResponseHandler = async (req, res) => {
    const context: CtxExpandedBotActingUserOauth2User = req.body.context;
    const zdOptions: ZDClientOptions = {
        oauth2UserAccessToken: context.oauth2.user?.token?.access_token,
        botAccessToken: context.bot_access_token,
        mattermostSiteUrl: context.mattermost_site_url,
    };

    // Get the saved service account config zendesk access_token
    const configStore = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    let config: AppConfigStore;
    let callResponse: AppCallResponse;
    try {
        config = await configStore.getValues();
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('fDisconnect - Unable to get config store values: ' + error.message);
        res.json(callResponse);
        return;
    }

    const configOauthToken = config.zd_oauth_access_token;
    const text = 'This mattermost account is connected via oauth2 to Zendesk for subscription functionality and cannot be disconnected until the access token is updated to a new user access token. Please have another connected Mattermost System Admin user with Zendesk Admin privileges run `/zendesk setup-webhook` to update the access_token';
    if (context.oauth2.user?.token?.access_token === configOauthToken) {
        callResponse = newOKCallResponseWithMarkdown(text);
        res.json(callResponse);
        return;
    }

    const zdClient = await newZDClient(zdOptions);
    let tokens: ZDTokensResponse;
    try {
        tokens = await zdClient.oauthtokens.list();
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('fDisconnect - Unable to list zendesk oauth tokens: ' + error.message);
        res.json(callResponse);
        return;
    }

    // Get the token ID
    const tokenID = getUserTokenID(zdOptions.oauth2UserAccessToken, tokens);

    // Delete the token from the proxy app
    const ppClient = newAppsClient(context.acting_user_access_token, context.mattermost_site_url);
    await ppClient.storeOauth2User({token: {}, role: ''});

    // Delete the zendesk user oauth token
    try {
        await zdClient.oauthtokens.revoke(tokenID);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('fDisconnect - failed to revoke acting user token');
        res.json(callResponse);
        return;
    }

    callResponse = newOKCallResponseWithMarkdown('You have disconnected your Zendesk account');
    res.json(callResponse);
};

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
