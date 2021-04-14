import {Request, Response} from 'express';

import {AppCallResponse} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {newProxyClient, ProxyClient} from '../clients';

import {getOAuthConfig} from '../app/oauth';
import {newOKCallResponse, newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {newConfigStore} from '../store';

import {contextFromRequest, Routes} from '../utils';

export async function fConnect(req: Request, res: Response): Promise<void> {
    const context = contextFromRequest(req);
    const url = context.oauth2.connect_url;
    res.json(newOKCallResponseWithMarkdown(`Follow this link to connect Mattermost to your Zendesk Account: [link](${url})`));
}

export async function fOauth2Connect(req: Request, res: Response): Promise<void> {
    const context = contextFromRequest(req);
    const state = req.body.values.state;

    const configStore = newConfigStore(context);
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
    const call: AppCall = req.body;
    const context = contextFromRequest(req);
    const code = call.values.code;
    if (code === '') {
        throw new Error('Bad Request: code param not provided'); // Express will catch this on its own.
    }

    const zdAuth = await getOAuthConfig(context);
    const url = context.oauth2.complete_url + '?code=' + code;
    const user = await zdAuth.code.getToken(url);
    const token = user.data.access_token;
    const ppClient = newProxyClient(call.context.acting_user_access_token, url);
    ppClient.storeOauth2User(token);
    res.json(newOKCallResponse());
}
