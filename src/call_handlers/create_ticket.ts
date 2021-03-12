import {AppCallResponse} from 'mattermost-redux/types/apps';

import {newOKCallResponse, newFormCallResponse, newErrorCallResponseWithMessage, newErrorCallResponseWithFieldErrors} from '../utils/call_responses';

import {newCreateTicketForm} from '../forms';

import {BaseCallHandler} from '../utils/helper_classes/base_call_handler';

import {newApp} from '../app/app';

// OpenCreateTicketForm opens a new create ticket form
export class OpenCreateTicketForm extends BaseCallHandler {
    handleSubmit = async (): Promise<AppCallResponse> => {
        const form = await newCreateTicketForm(this.call);
        return newFormCallResponse(form);
    }
}

// SubmitOrUpdateCreateTicketForm updates the create ticket form with new values or
// submits the ticket if submit button is clicked
export class SubmitOrUpdateCreateTicketForm extends BaseCallHandler {
    // update the values in the form
    handleForm = async (): Promise<AppCallResponse> => {
        const form = await newCreateTicketForm(this.call);
        return newFormCallResponse(form);
    }

    // submit the ticket
    handleSubmit = async (): Promise<AppCallResponse> => {
        try {
            const app = newApp(this.call);
            const fieldErrors = await app.createTicketFromPost();

            // response with errors
            if (Object.keys(fieldErrors).length !== 0) {
                return newErrorCallResponseWithFieldErrors(fieldErrors);
            }
        } catch (err) {
            return newErrorCallResponseWithMessage(err.message);
        }

        return newOKCallResponse();
    }
}
