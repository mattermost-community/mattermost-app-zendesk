import {AppCallRequest, AppCallResponse} from 'mattermost-redux/types/apps';

import {newFormCallResponse, newErrorCallResponseWithMessage, CallResponseHandler} from '../utils/call_responses';
import {newCreateTicketForm} from '../forms';
import {newApp} from '../app/app';

// fOpenCreateTicketForm opens a new create ticket form
export const fOpenCreateTicketForm: CallResponseHandler = async (req, res) => {
    let callResponse: AppCallResponse;
    try {
        const form = await newCreateTicketForm(req.body);
        callResponse = newFormCallResponse(form);
        res.json(callResponse);
    } catch (error) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create ticket form: ' + error.message);
        res.json(callResponse);
    }
};

// fSubmitOrUpdateCreateTicketForm updates the create ticket form with new values or submits the ticket if submit button is clicked
export const fSubmitOrUpdateCreateTicketForm: CallResponseHandler = async (req, res) => {
    let callResponse: AppCallResponse;
    try {
        const form = await newCreateTicketForm(req.body);
        callResponse = newFormCallResponse(form);
        res.json(callResponse);
    } catch (error) {
        callResponse = newErrorCallResponseWithMessage('Unable to update create ticket form: ' + error.message);
        res.json(callResponse);
    }
};

// fSubmitOrUpdateCreateTicketSubmit creates a ticket
export const fSubmitOrUpdateCreateTicketSubmit: CallResponseHandler = async (req, res) => {
    const call: AppCallRequest = req.body;
    let callResponse: AppCallResponse;
    try {
        const app = newApp(call);
        callResponse = await app.createTicketFromPost();
        res.json(callResponse);
    } catch (err) {
        callResponse = newErrorCallResponseWithMessage('Unable to create ticket from post: ' + err.message);
        res.json(callResponse);
    }
};
