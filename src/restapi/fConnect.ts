import {Request, Response} from 'express';

import {AppCallResponse} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {getOAuthConfig} from '../app/oauth';
import {newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {newConfigStore} from '../store';

import {contextFromRequest, Routes} from '../utils';

export async function fConnect(req: Request, res: Response): Promise<void> {
    const context = contextFromRequest(req);
    const url = context.oauth2.connect_url;
    res.json(newOKCallResponseWithMarkdown(`Follow this link to connect Mattermost to your Zendesk Account: [link](${url})`));
}

export async function fOauth2Connect(req: Request, res: Response): Promise<void> {
    console.log('call', req.body);
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
    console.log('link', link);
    res.json(callResponse);
}

export async function fOauth2Complete(req: Request, res: Response): Promise<void> {
    console.log('<><><> !!!. IN HERE!');
    console.log('req.body', req.body);
    const context = contextFromRequest(req);
    const url = context.oauth2.connect_url;

    // res.json(newOKCallResponseWithMarkdown(`Follow this link to connect Mattermost to your Zendesk Account: [link](${url})`));

    const code = req.body.values.code;
    if (code === '') {
        throw new Error('Bad Request: code param not provided'); // Express will catch this on its own.
    }

    const state = req.body.values.state;
    if (state === '') {
        throw new Error('Bad Request: state param not provided'); // Express will catch this on its own.
    }

    // const parsedState = parseOAuthState(state);
    // if (parsedState.err !== '') {
    //     throw new Error('Bad Request: bad state'); // Express will catch this on its own.
    // }
    //
    // const context = createContextFromState(parsedState.botToken, parsedState.url);
    const zdAuth = await getOAuthConfig(context);

    const newurl = context.oauth2.complete_url;
    console.log('newurl', newurl);

    // const user = await zdAuth.code.getToken(req.originalUrl);
    const user = await zdAuth.code.getToken(newurl);

    const token = user.data.access_token;
    console.log('token', token);

    //
    // newTokenStore(context).storeToken(parsedState.userID, token);
    //
    // const connectedString = 'You have successfuly connected the Zendesk Mattermost App to Zendesk. Please close this window.';
    // const html = `
    // <!DOCTYPE html>
    // <html>
    // 	<head>
    // 		<script>
    // 			window.close();
    // 		</script>
    // 	</head>
    // 	<body>
    // 		<p>${connectedString}</p>
    // 	</body>
    // </html>
    // `;
    //
    // res.setHeader('Content-Type', 'text/html');
    // res.send(html);

    // const code = req.query.code;
    // if (code === '') {
    //     throw new Error('Bad Request: code param not provided'); // Express will catch this on its own.
    // }
    //
    // const state = String(req.query.state);
    // if (state === '') {
    //     throw new Error('Bad Request: state param not provided'); // Express will catch this on its own.
    // }
    //
    // const parsedState = parseOAuthState(state);
    // if (parsedState.err !== '') {
    //     throw new Error('Bad Request: bad state'); // Express will catch this on its own.
    // }
    //
    // const context = createContextFromState(parsedState.botToken, parsedState.url);
    // const zdAuth = await getOAuthConfig(context);
    //
    // const user = await zdAuth.code.getToken(req.originalUrl);
    // const token = user.data.access_token;
    //
    // newTokenStore(context).storeToken(parsedState.userID, token);
    //
    // const connectedString = 'You have successfuly connected the Zendesk Mattermost App to Zendesk. Please close this window.';
    // const html = `
    // <!DOCTYPE html>
    // <html>
    // 	<head>
    // 		<script>
    // 			window.close();
    // 		</script>
    // 	</head>
    // 	<body>
    // 		<p>${connectedString}</p>
    // 	</body>
    // </html>
    // `;
    //
    // res.setHeader('Content-Type', 'text/html');
    // res.send(html);
}
