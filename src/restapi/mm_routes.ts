import fs from 'fs';

import express, {Request, Response} from 'express';

import {AppCall} from 'mattermost-redux/types/apps';

import app from '../app/app';
import {getBindings} from '../app/bindings';
import {newCreateTicketForm} from '../forms/create_ticket';
import {jsonStoreFileName} from '../utils/constants';

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
    // Write json file store
    fs.writeFile(jsonStoreFileName, JSON.stringify(req.body.values), 'utf8', (err) => {
        if (err) {
            console.log(err);
            res.statusMessage = 'unable to write json storage file';
            res.status(400).end();
        } else {
            console.log(jsonStoreFileName, ' successfully written');
            res.sendStatus(200);
        }
    });
});

router.post('/oauth2/complete', (req: Request, res: Response) => {
    res.send('hello');
});

export default router;
