import fs from 'fs';

import express, {Request, Response} from 'express';

import {AppCallResponse} from 'mattermost-redux/constants/apps';

import {getManifest} from '../../manifest';
import {getBindings} from '../bindings';
import {CreateTicketForm} from '../forms';
import {zendesk, routes, createOAuthState} from '../utils';
import config from '../store/config';

const router = express.Router();

router.get(routes.ManifestPath, fManifest);
router.get(routes.BindingsPath, fBindings);

// router.post(routes.InstallPath, extractCall(fInstall));
router.post(routes.InstallPath, fInstall);
router.post(routes.BindingPathConnect, fConnect);
router.post(routes.BindingPathCreateForm, fCreateForm);

function fInstall(req: Request, res: Response): AppCallResponse {
    config.storeInstallInfo(req);
    res.json({});
}

function fConnect(req: Request, res: Response): AppCallResponse {
    const context = req.body.context;
    const state = createOAuthState(context);

    // const connectLink = zendesk.host +
    const callResponse: AppCallResponse = {
        type: '',
        markdown: 'Follow this link to connect: [link](zendesk.)',
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
