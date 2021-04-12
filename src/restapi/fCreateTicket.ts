import {Request, Response} from 'express';
import {AppCallResponse, AppCallRequest} from 'mattermost-redux/types/apps';

import {newFormCallResponse, newOKCallResponse, newErrorCallResponseWithMessage} from 'utils/call_responses';
import {newCreateTicketForm} from 'forms';
import {newApp} from 'app/app';

// fOpenCreateTicketForm opens a new create ticket form
export async function fOpenCreateTicketForm(req: Request, res: Response): Promise<void> {
    const form = await newCreateTicketForm(req.body);
    const callResponse = newFormCallResponse(form);
    res.json(callResponse);
}

// fSubmitOrUpdateCreateTicketForm updates the create ticket form with new values or
// submits the ticket if submit button is clicked
export async function fSubmitOrUpdateCreateTicketForm(req: Request, res: Response): Promise<void> {
    const form = await newCreateTicketForm(req.body);
    const callResponse = newFormCallResponse(form);
    res.json(callResponse);
}

// fSubmitOrUpdateCreateTicketSubmit creates a ticket
export async function fSubmitOrUpdateCreateTicketSubmit(req: Request, res: Response): Promise<void> {
    const call: AppCallRequest = req.body;
    let callResponse: AppCallResponse = newOKCallResponse();
    try {
        const app = newApp(call);
        callResponse = await app.createTicketFromPost();
    } catch (err) {
        callResponse = newErrorCallResponseWithMessage(err.message);
    }
    res.json(callResponse);
}
