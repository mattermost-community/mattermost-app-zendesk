import {AppCallRequest, AppCallResponse} from 'mattermost-redux/types/apps';

import {CallResponseHandler, newErrorCallResponseWithMessage, newFormCallResponse} from '../utils/call_responses';
import {newCreateTicketForm} from '../forms';
import {newApp} from '../app/app';

import {tryCallResponseWithMessage} from '../utils/utils';

// fOpenCreateTicketForm opens a new create ticket form
export const fOpenCreateTicketForm: CallResponseHandler = async (req, res) => {
    const form = await tryCallResponseWithMessage(
        newCreateTicketForm(req.body),
        'Unable to open create ticket form',
        res
    );
    const callResponse = newFormCallResponse(form);
    res.json(callResponse);
};

// fSubmitOrUpdateCreateTicketForm updates the create ticket form with new values or submits the ticket if submit button is clicked
export const fSubmitOrUpdateCreateTicketForm: CallResponseHandler = async (req, res) => {
    const form = await tryCallResponseWithMessage(
        newCreateTicketForm(req.body),
        'Unable to update create ticket form',
        res
    );
    const callResponse = newFormCallResponse(form);
    res.json(callResponse);
};

// fSubmitOrUpdateCreateTicketSubmit creates a ticket
export const fSubmitOrUpdateCreateTicketSubmit: CallResponseHandler = async (req, res) => {
    const call: AppCallRequest = req.body;
    const app = newApp(call);
    const callResponse = await tryCallResponseWithMessage(
        app.createTicketFromPost(),
        'Unable to create ticket from post',
        res
    );
    res.json(callResponse);
};
