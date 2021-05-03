import {Request, Response} from 'express';
import ClientOAuth2 from 'client-oauth2';
import {AppCallResponse} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {AppCallRequestWithValues, ExpandedOauth2App, CtxExpandedActingUserOauth2AppBot, CtxExpandedBotActingUserOauth2AppOauth2User} from '../types/apps';
import {ZDClientOptions} from 'clients/zendesk';
import {newOKCallResponse, newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {newConfigStore} from '../store';
import {Routes} from '../utils';
import {ZDRoles} from '../utils/constants';
import {newApp} from '../app/app';
import {newAppsClient, newZDClient} from '../clients';
import {getOAuthConfig} from '../app/oauth';
import {StoredOauthUserToken} from 'utils/ZDTypes';

export async function fConnect(req: Request, res: Response): Promise<void> {
    const context: ExpandedOauth2App = req.body.context;
    const url = context.oauth2.connect_url;
    res.json(newOKCallResponseWithMarkdown(`Follow this [link](${url}) to connect Mattermost to your Zendesk Account.`));
}

export async function fOauth2Connect(req: Request, res: Response): Promise<void> {
    const context: CtxExpandedActingUserOauth2AppBot = req.body.context;
    const state = req.body.values.state;

    const configStore = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    const config = await configStore.getValues();
    const zdHost = config.zd_url;
    const clientID = context.oauth2.client_id;

    const url = zdHost + Routes.ZD.OAuthAuthorizationURI;
    const urlWithParams = new URL(url);
    urlWithParams.searchParams.append('response_type', 'code');
    urlWithParams.searchParams.append('client_id', clientID);
    urlWithParams.searchParams.append('state', state);
    urlWithParams.searchParams.append('scope', 'read write');

    const link = urlWithParams.href;
    const callResponse: AppCallResponse = {
        type: AppCallResponseTypes.OK,
        data: link,
    };
    res.json(callResponse);
}

export async function fOauth2Complete(req: Request, res: Response): Promise<void> {
    const call: AppCallRequestWithValues = req.body;
    const context: CtxExpandedBotActingUserOauth2AppOauth2User = req.body.context;
    context.oauth2.user = {
        token: {
            access_token: '',
        },
        is_agent: false,
    };

    const code = call.values.code;
    if (code === '') {
        throw new Error('Bad Request: code param not provided');
    }

    const zdAuth = await getOAuthConfig(context);
    const zdURL = context.oauth2.complete_url + '?code=' + code;
    const user = await zdAuth.code.getToken(zdURL);
    const token: ClientOAuth2.Data = user.data;
    const accessToken: string = token.access_token;

    // determine if the user is an admin
    const zdOptions: ZDClientOptions = {
        oauth2UserAccessToken: accessToken,
        botAccessToken: context.bot_access_token,
        mattermostSiteUrl: context.mattermost_site_url,
    };
    const zdClient = await newZDClient(zdOptions);
    const me = await zdClient.users.me();
    let dmText = 'You have successfully connected your Zendesk account!';
    let isAgent = true;
    if (me.role !== ZDRoles.admin) {
        isAgent = false;
        dmText += '  This app currently supports Zendesk admin accounts and does not provide any features for end-user accounts.';
    }

    const mmURL = context.mattermost_site_url;
    const ppClient = newAppsClient(context.acting_user_access_token, mmURL);

    const storedToken: StoredOauthUserToken = {
        token,
        is_agent: isAgent,
    };
    await ppClient.storeOauth2User(storedToken);
    const app = newApp(call);
    await app.createBotDMPost(dmText);
    res.json(newOKCallResponse());
}
