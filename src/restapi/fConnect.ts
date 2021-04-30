import {Request, Response} from 'express';
import ClientOAuth2 from 'client-oauth2';
import {AppCallResponse} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {AppCallRequestWithValues, ExpandedOauth2App, CtxExpandedActingUserOauth2AppBot} from '../types/apps';
import {newOKCallResponse, newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {newConfigStore} from '../store';
import {Routes} from '../utils';
import {newApp} from '../app/app';
import {newAppsClient} from '../clients';
import {getOAuthConfig} from '../app/oauth';

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
    const context: CtxExpandedActingUserOauth2AppBot = req.body.context;
    context.oauth2.user = {
        access_token: '',
    };
    const app = newApp(req.body);
    const code = call.values.code;
    if (code === '') {
        throw new Error('Bad Request: code param not provided'); // Express will catch this on its own.
    }

    const zdAuth = await getOAuthConfig(context);
    const zdURL = context.oauth2.complete_url + '?code=' + code;
    const user = await zdAuth.code.getToken(zdURL);
    const token: ClientOAuth2.Data = user.data;

    const mmURL = context.mattermost_site_url;
    const ppClient = newAppsClient(context.acting_user_access_token, mmURL);
    ppClient.storeOauth2User(token);
    app.createBotDMPost('You have successfully connected your Zendesk acccount!');
    res.json(newOKCallResponse());
}
