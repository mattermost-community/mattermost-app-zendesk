import {Request, Response} from 'express';
import {AppCallResponse} from 'mattermost-redux/types/apps';

import {ENV, routes, createOAuthState, zendeskClientID} from '../utils';

export function fConnect(req: Request, res: Response): void {
    const context = req.body.context;
    const state = createOAuthState(context);

    const url = ENV.zendesk.host + routes.zd.OAuthAuthorizationURI;

    const urlWithParams = new URL(url);
    urlWithParams.searchParams.append('response_type', 'code');
    urlWithParams.searchParams.append('client_id', zendeskClientID);
    urlWithParams.searchParams.append('state', state);
    urlWithParams.searchParams.append('scope', 'read write');

    const link = urlWithParams.href;
    const callResponse: AppCallResponse = {
        type: '',
        markdown: `Follow this link to connect: [link](${link})`,
    };
    res.json(callResponse);
}

