import {Request, Response} from 'express';
import {AppCallRequest} from 'mattermost-redux/types/apps';

import {newFormCallResponse, newErrorCallResponseWithMessage} from '../utils/call_responses';
import {newCreateTicketForm} from '../forms';
import {newApp} from '../app/app';

// fOpenCreateTicketForm opens a new create ticket form
export async function fOpenCreateTicketForm(req: Request, res: Response): Promise<void> {
    try {
        const form = await newCreateTicketForm(req.body);
        res.json(newFormCallResponse(form));
    } catch (error) {
        res.json(newErrorCallResponseWithMessage('Unable to open create ticket form: ' + error.message));
    }
}

// fSubmitOrUpdateCreateTicketForm updates the create ticket form with new values or
// submits the ticket if submit button is clicked
export async function fSubmitOrUpdateCreateTicketForm(req: Request, res: Response): Promise<void> {
    try {
        const form = await newCreateTicketForm(req.body);
        res.json(newFormCallResponse(form));
    } catch (error) {
        res.json(newErrorCallResponseWithMessage('Unable to update create ticket form: ' + error.message));
    }
}

// fSubmitOrUpdateCreateTicketSubmit creates a ticket
export async function fSubmitOrUpdateCreateTicketSubmit(req: Request, res: Response): Promise<void> {
    const call: AppCallRequest = req.body;
    try {
        const app = newApp(call);
        res.json(await app.createTicketFromPost());
    } catch (err) {
        res.json(newErrorCallResponseWithMessage(err.message));
    }
}
