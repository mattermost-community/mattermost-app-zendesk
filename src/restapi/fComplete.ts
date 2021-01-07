import {Request, Response} from 'express';

import {getOAuthConfig, parseOAuthState} from '../app/oauth';

import {oauth} from '../store';

export async function fComplete(req: Request, res: Response): Promise<void> {
    const code = req.query.code;
    if (code === '') {
        throw new Error('Bad Request: code param not provided'); // Express will catch this on its own.
    }

    const state = req.query.state;
    if (state === '') {
        throw new Error('Bad Request: state param not provided'); // Express will catch this on its own.
    }

    const [userID,, err] = parseOAuthState(state);
    if (err !== '') {
        throw new Error('Bad Request: bad state'); // Express will catch this on its own.
    }

    // Exchange code for token
    const zendeskAuth = getOAuthConfig();
    const user = await zendeskAuth.code.getToken(req.originalUrl);
    const token = user.data.access_token;

    oauth.storeToken(userID, token);

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

