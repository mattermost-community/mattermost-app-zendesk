import express, {Request, Response} from 'express';

import {AppCallResponse} from 'mattermost-redux/types/apps';

import {zendesk} from '../clients';

import {getOAuthConfig} from '../app/oauth';

import {getManifest} from '../../manifest';
import {getBindings} from '../bindings';
import {CreateTicketForm} from '../forms';
import {ENV, routes, createOAuthState, parseOAuthState, zendeskClientID} from '../utils';
import {config, oauth} from '../store';

const router = express.Router();

router.get(routes.app.ManifestPath, fManifest);
router.get(routes.app.BindingsPath, fBindings);
router.get(routes.app.OAuthCompletePath, fComplete);

// router.post(routes.InstallPath, extractCall(fInstall));
router.post(routes.app.InstallPath, fInstall);
router.post(routes.app.BindingPathConnect, fConnect);
router.post(routes.app.BindingPathDisconnect, fDisconnect);
router.post(routes.app.BindingPathCreateForm, fCreateForm);

function fInstall(req: Request, res: Response): void {
    config.storeInstallInfo(req);
    res.json({});
}

async function fComplete(req: Request, res: Response): Promise<void> {
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

    // TODO make this html look nicer
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

    // TODO verify state
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
}

function fConnect(req: Request, res: Response): void {
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

async function fDisconnect(req: Request, res: Response): Promise<void> {
    const context = req.body.context;
    const [token, found] = oauth.getToken(context.acting_user_id);

    const zdClient = zendesk.newClient(token, ENV.zendesk.apiURL);

    // get current token. this request will be recognzied as the token coming
    // from the zendesk app
    const currentToken = await zdClient.oauthtokens.current();

    // get the token ID
    const currentTokenID = currentToken.token.id;

    // delete the user zendesk oauth token
    await zdClient.oauthtokens.revoke(currentTokenID);

    // delete the token from the store
    oauth.deleteToken(context.acting_user_id);
    const callResponse: AppCallResponse = {
        type: '',
        markdown: 'You have disconnected your Zendesk account',
    };
    res.json(callResponse);
}

function fManifest(_: Request, res: Response): void {
    res.json(getManifest());
}

function fBindings(req: Request, res: Response): void {
    const userID = req.query.acting_user_id;
    res.json(getBindings(userID));
}

async function fCreateForm(req: Request, res: Response): Promise<void> {
    const form = await new CreateTicketForm(req.body).handle();
    res.json(form);
}

// function extractCall(f callHandler) http.HandlerFunc {
//   return function()
// }

export default router;
