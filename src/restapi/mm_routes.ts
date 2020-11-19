import fs from 'fs';

import express, { Request, Response } from 'express';

import app from '../app/app';
import http from '../app/http';

const router = express.Router();

router.post('/createform', (req: Request, res: Response) => {
    if (req.body.type == 'form') {
        // const formData = app.getCreateForm(req.body.context.post.message)
        fs.readFile('create_form.json', (err, data) => {
            if (err) {
                throw err;
            }
            const formData = JSON.parse(data.toString());
            formData.form.fields[2].value = req.body.context.post.message;
            res.json(formData);
        });
    } else {
        const { acting_user_id, post_id, team_id, channel_id } = req.body.context;
        const values = req.body.values
        const ticket = app.getTicketForPost(values)
        app.createTicketFromPost(ticket, channel_id, acting_user_id, post_id);
        res.sendStatus(200);
    }
});

router.get('/manifest.json', (req: Request, res: Response) => {
    fs.readFile('manifest.json', (err, data) => {
        if (err) {
            throw err;
        }
        const manifest = JSON.parse(data.toString());
        res.json(manifest);
    });
});

router.get('/bindings', (req: Request, res: Response) => {
    fs.readFile('bindings.json', (err, data) => {
        if (err) {
            throw err;
        }
        const bindings = JSON.parse(data.toString());
        res.json(bindings);
    });
});

router.get('/install', (req: Request, res: Response) => {
    http.installApp();
    const manifest = '/install post';
    res.send(manifest);
});

export default router;
