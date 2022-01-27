import {AppCallRequest, AppCallResponse} from 'mattermost-redux/types/apps';

import {CallResponseHandler, newErrorCallResponseWithMessage, newFormCallResponse} from '../utils/call_responses';
import {newCreateTicketForm} from '../forms';
import {newApp} from '../app/app';

import {tryCallResponseWithMessage} from '../utils/utils';

// fOpenCreateTicketForm opens a new create ticket form
export const fOpenCreateTicketForm: CallResponseHandler = async (req, res) => {
    await tryCallResponseWithMessage(
        newCreateTicketForm(req.body).then((form) => {
            const callResponse = newFormCallResponse(form);
            res.json(callResponse);
        }),
        'Unable to open create ticket form',
        res
    );
};

// fSubmitOrUpdateCreateTicketForm updates the create ticket form with new values or submits the ticket if submit button is clicked
export const fSubmitOrUpdateCreateTicketForm: CallResponseHandler = async (req, res) => {
    await tryCallResponseWithMessage(
        newCreateTicketForm(req.body).then((form) => {
            const callResponse = newFormCallResponse(form);
            res.json(callResponse);
        }),
        'Unable to update create ticket form',
        res
    );
};

// fSubmitOrUpdateCreateTicketSubmit creates a ticket
export const fSubmitOrUpdateCreateTicketSubmit: CallResponseHandler = async (req, res) => {
    const call: AppCallRequest = req.body;
    const app = newApp(call);
    await tryCallResponseWithMessage(
        app.createTicketFromPost().then((callResponse) => res.json(callResponse)),
        'Unable to create ticket from post',
        res
    );
};
