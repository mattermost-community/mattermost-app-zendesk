import {Request, Response} from 'express';

import {AppContext} from 'mattermost-redux/types/apps';

import {newOKCallResponseWithMarkdown} from '../utils/call_responses';

import {newConfigStore} from '../store';

import {Routes, createOAuthState} from '../utils';

export async function fConnect(req: Request, res: Response): Promise<void> {
    const context: AppContext = req.body.context;
    const state = createOAuthState(context);

    const configStore = newConfigStore(context);
    const config = await configStore.getValues();
    const zdHost = config.zd_url;
    const clientID = config.zd_client_id;

    const url = zdHost + Routes.ZD.OAuthAuthorizationURI;
    const urlWithParams = new URL(url);
    urlWithParams.searchParams.append('response_type', 'code');
    urlWithParams.searchParams.append('client_id', clientID);
    urlWithParams.searchParams.append('state', state);
    urlWithParams.searchParams.append('scope', 'read write');

    const link = urlWithParams.href;
    res.json(newOKCallResponseWithMarkdown(`Follow this link to connect: [link](${link})`));
}
