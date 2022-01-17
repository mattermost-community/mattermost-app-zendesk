import ClientOAuth2, {Token} from 'client-oauth2';
import {AppCallResponse} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {AppCallRequestWithValues, CtxExpandedActingUserOauth2AppBot, CtxExpandedBotActingUserOauth2AppOauth2User, ExpandedOauth2App} from '../types/apps';
import {ZDClientOptions} from 'clients/zendesk';
import {CallResponseHandler, newOKCallResponse, newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {AppConfigStore, newConfigStore} from '../store/config';
import {Routes, tryCallResponseWithMessage} from '../utils';
import {ZDRoles} from '../utils/constants';
import {newApp} from '../app/app';
import {newAppsClient, newZDClient} from '../clients';
import {getOAuthConfig} from '../app/oauth';
import {StoredOauthUserToken} from 'utils/ZDTypes';

export const fConnect: CallResponseHandler = async (req, res) => {
    const context: ExpandedOauth2App = req.body.context;
    const url = context.oauth2.connect_url;
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(`Follow this [link](${url}) to connect Mattermost to your Zendesk Account.`);
    res.json(callResponse);
};

export const fOauth2Connect: CallResponseHandler = async (req, res) => {
    const context: CtxExpandedActingUserOauth2AppBot = req.body.context;
    const state = req.body.values.state;

    const configStore = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    let config: AppConfigStore;
    let callResponse: AppCallResponse;
    config = await tryCallResponseWithMessage(configStore.getValues(), 'fOauth2Connect - Unable to get config store values', res);
    const zdHost = config.zd_url;
    const clientID = context.oauth2.client_id;

    const url = zdHost + Routes.ZD.OAuthAuthorizationURI;
    const urlWithParams = new URL(url);
    urlWithParams.searchParams.append('response_type', 'code');
    urlWithParams.searchParams.append('client_id', clientID);
    urlWithParams.searchParams.append('state', state);
    urlWithParams.searchParams.append('scope', 'read write');

    const link = urlWithParams.href;
    callResponse = {
        type: AppCallResponseTypes.OK,
        data: link,
    };
    res.json(callResponse);
};

export const fOauth2Complete: CallResponseHandler = async (req, res) => {
    const call: AppCallRequestWithValues = req.body;
    const context: CtxExpandedBotActingUserOauth2AppOauth2User = req.body.context;

    const code = call.values.code;
    if (code === '') {
        throw new Error('Bad Request: code param not provided');
    }

    let zdAuth: ClientOAuth2;
    let callResponse: AppCallResponse;
    zdAuth = await tryCallResponseWithMessage(getOAuthConfig(context), 'fOauth2Complete - Unable to get oauth config', res);
    const zdURL = context.oauth2.complete_url + '?code=' + code;

    let user: Token;
    user = await tryCallResponseWithMessage(zdAuth.code.getToken(zdURL), 'fOauth2Complete - Unable to get user token', res);

    const token: ClientOAuth2.Data = user.data;
    const accessToken: string = token.access_token;

    // determine if the user is an admin
    const zdOptions: ZDClientOptions = {
        oauth2UserAccessToken: accessToken,
        botAccessToken: context.bot_access_token,
        mattermostSiteUrl: context.mattermost_site_url,
    };
    const zdClient = await newZDClient(zdOptions);
    let me: any;
    me = tryCallResponseWithMessage(zdClient.users.me(), 'fOauth2Complete - Unable to get current zendesk user', res);
    let dmText = 'You have successfully connected your Zendesk account!';
    if (me.role !== ZDRoles.admin && me.role !== ZDRoles.agent) {
        dmText += '  This app currently supports Zendesk admin and agent accounts and does not provide any features for end-user accounts.';
    }

    const mmURL = context.mattermost_site_url;
    const ppClient = newAppsClient(context.acting_user_access_token, mmURL);

    const storedToken: StoredOauthUserToken = {
        token,
        role: me.role,
    };
    await tryCallResponseWithMessage(ppClient.storeOauth2User(storedToken), 'fOauth2Complete - Unable to store oauth2user', res)
    const app = newApp(call);
    await tryCallResponseWithMessage(app.createBotDMPost(dmText), 'fOauth2Complete - Unable to create bot DM post', res)
    callResponse = newOKCallResponse();
    res.json(callResponse);
};
