import {Request, Response} from 'express';

import {AppContextWithBot} from 'types/apps';

import {getOAuthConfig} from '../app/oauth';
import {parseOAuthState} from '../utils';

import {newTokenStore} from '../store';

// fComplete is the endpoint called by zendesk after a user approves oauth
export async function fComplete(req: Request, res: Response): Promise<void> {
    const code = req.query.code;
    if (code === '') {
        throw new Error('Bad Request: code param not provided'); // Express will catch this on its own.
    }

    const state = String(req.query.state);
    if (state === '') {
        throw new Error('Bad Request: state param not provided'); // Express will catch this on its own.
    }

    const parsedState = parseOAuthState(state);
    if (parsedState.err !== '') {
        throw new Error('Bad Request: bad state'); // Express will catch this on its own.
    }

    const context: AppContextWithBot = createContextFromState(parsedState.botToken, parsedState.url);
    const zdAuth = await getOAuthConfig(context);

    const user = await zdAuth.code.getToken(req.originalUrl);
    const token = user.data.access_token;

    newTokenStore(context).storeToken(parsedState.userID, token);

    const connectedString = 'You have successfuly connected the Zendesk Mattermost App to Zendesk. Please close this window.';
    const html = `
		<!DOCTYPE html>
		<html>
			<head>
				<script>
					window.close();
				</script>
			</head>
			<body>
				<p>${connectedString}</p>
			</body>
		</html>
		`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
}

// createContextFromState constructs an AppContext from state. fComplete needs
// access to the PluginKVStore and retrieves the token and url from state
function createContextFromState(botToken: string, url: string): AppContextWithBot {
    const context = {
        app_id: '',
        bot_access_token: botToken,
        mattermost_site_url: url,
    } as AppContextWithBot;
    return context;
}

