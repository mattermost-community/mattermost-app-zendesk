import fs from 'fs';

import express, {Request, Response} from 'express';

import {AppCall} from 'mattermost-redux/types/apps';

import {getManifest} from '../../manifest';
import app from '../app/app';
import {getBindings} from '../bindings';
import {newCreateTicketForm} from '../forms/create_ticket';
import store from '../app/store';

const router = express.Router();

router.post('/createform', async (req: Request, res: Response) => {
    const appCall: AppCall = req.body;
    if (appCall.type === 'form') {
        const createTicketForm = newCreateTicketForm(appCall.context.post.message);
        res.json(createTicketForm);
    } else {
        try {
            await app.createTicketFromPost(appCall);
            res.json({});
        } catch (err) {
            res.json({
                type: 'error',
                error: err.message,
            });
        }
    }
});

router.get('/manifest.json', (req: Request, res: Response) => {
    res.json(getManifest());
});

router.get('/bindings', (req: Request, res: Response) => {
    res.json(getBindings());
});

router.post('/install', (req: Request, res: Response) => {
    store.storeInstallInfo(req.body.values);
    res.json({});
});

router.post('/oauth2/complete', (req: Request, res: Response) => {
    res.send('hello');
});

export default router;
