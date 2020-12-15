import fs from 'fs';

import express, {Request, Response} from 'express';

import {AppCall} from 'mattermost-redux/types/apps';

import app from '../app/app';
import {getBindings} from '../bindings';
import {newCreateTicketForm} from '../forms/create_ticket';
import {jsonStoreFileName} from '../utils/constants';
import store from '../app/store';

const router = express.Router();

router.post('/createform', async (req: Request, res: Response) => {
    const appCall: AppCall = req.body;
    if (appCall.type === 'form') {
        const createTicketForm = newCreateTicketForm(appCall.context.post.message);
        res.json(createTicketForm);
    } else {
        const message = app.createTicketFromPost(appCall);
        res.json({});
    }
});

router.get('/manifest.json', (req: Request, res: Response) => {
    res.json(app.getManifest());
});

router.get('/bindings', (req: Request, res: Response) => {
    res.json(getBindings());
});

router.post('/install', (req: Request, res: Response) => {
    // save values from request into JSON file store
    const [httpStatus, message] = store.storeInstallInfo(req.body.values);
    res.statusMessage = message;
    res.status(httpStatus).end();
});

router.post('/oauth2/complete', (req: Request, res: Response) => {
    res.send('hello');
});

export default router;
