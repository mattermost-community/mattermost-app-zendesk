import fs from 'fs';

import express, {Request, Response} from 'express';

import {getManifest} from '../../manifest';
import {getBindings} from '../bindings';
import {CreateTicketForm} from '../forms';
import store from '../app/store';

const router = express.Router();

router.post('/createform', async (req: Request, res: Response) => {
    const form = await new CreateTicketForm(req.body).handle();
    res.json(form);
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
