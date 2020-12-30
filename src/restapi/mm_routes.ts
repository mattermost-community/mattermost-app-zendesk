import express, {Request, Response} from 'express';

import {AppCallResponse} from 'mattermost-redux/constants/apps';

import {getOAuthConfig} from '../app/oauth';

import {getManifest} from '../../manifest';
import {getBindings} from '../bindings';
import {CreateTicketForm} from '../forms';
import {ENV, routes, createOAuthState} from '../utils';
import config from '../store/config';

const router = express.Router();

router.get(routes.ManifestPath, fManifest);
router.get(routes.BindingsPath, fBindings);
router.get(routes.OAuthCompletePath, fComplete);

// router.post(routes.InstallPath, extractCall(fInstall));
router.post(routes.InstallPath, fInstall);
router.post(routes.BindingPathConnect, fConnect);
router.post(routes.BindingPathCreateForm, fCreateForm);

function fInstall(req: Request, res: Response): AppCallResponse {
    config.storeInstallInfo(req);
    res.json({});
}

async function fComplete(req: Request, res: Response): AppCallResponse {
    const code = req.query.code;
    if (code === '') {
        throw new Error('Bad Request: code param not provided'); // Express will catch this on its own.
    }

    // Exchange code for token
    const zendeskAuth2 = getOAuthConfig();
    const user = await zendeskAuth2.code.getToken(req.originalUrl);
    const token = user.data.access_token;

    // TODO store token

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
				<p>%s</p>
			</body>
		</html>
		${connectedString}`;

    // TODO verify state
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
}

function fConnect(req: Request, res: Response): AppCallResponse {
    const context = req.body.context;
    const state = createOAuthState(context);

    const url = ENV.zendesk.host + routes.OAuthPath + routes.OAuthPath2;

    const urlWithParams = new URL(url);
    urlWithParams.searchParams.append('response_type', 'code');
    urlWithParams.searchParams.append('client_id', 'mattermost_zendesk_app');
    urlWithParams.searchParams.append('state', state);
    urlWithParams.searchParams.append('scope', 'read write');

    const link = urlWithParams.href;
    const callResponse: AppCallResponse = {
        type: '',
        markdown: `Follow this link to connect: [link](${link})`,
    };
    res.json(callResponse);
}

function fManifest(req: Request, res: Response): AppCallResponse {
    res.json(getManifest());
}

function fBindings(req: Request, res: Response): AppCallResponse {
    res.json(getBindings());
}

async function fCreateForm(req: Request, res: Response): AppCallResponse {
    const form = await new CreateTicketForm(req.body).handle();
    res.json(form);
}

// function extractCall(f callHandler) http.HandlerFunc {
//   return function()
// }

export default router;
