import {AppCallResponseTypes, AppCallTypes} from 'mattermost-redux/constants/apps';
import {AppCall, AppCallResponse} from 'mattermost-redux/types/apps';

import app from '../app/app';

import {newCreateTicketForm} from './create_ticket';

// BaseForm routes the call type to its corresponding method
export class BaseForm {
    call: AppCall

    constructor(call: AppCall) {
        this.call = call;
    }

    // handle delegates form handling based on AppCall type
    handle = (): Promise<AppCallResponse> => {
        switch (this.call.type) {
        case 'form':
            return this.handleForm();
        case 'lookup':
            return this.handleLookup();
        case 'submit':
            return this.handleSubmit();
        default:
            return this.handleSubmit();
        }
    }
    handleForm = (): Promise<AppCallResponse> => {
        throw new Error('handleForm not implemented');
    };
    handleLookup = (): Promise<AppCallResponse> => {
        throw new Error('handleLookup not implemented');
    };
    handleSubmit = (): Promise<AppCallResponse> => {
        throw new Error('handleSubmit not implemented');
    };
}

// OpenCreateTicketForm opens a new create ticket form
export class OpenCreateTicketForm extends BaseForm {
    handleSubmit = async (): Promise<AppCallResponse> => {
        return {
            type: AppCallTypes.FORM,
            form: await newCreateTicketForm(this.call),
        };
    }
}

// SubmitOrUpdateCreateTicketForm updates the create ticket form with new values or
// submits the ticket if submit button is clicked
export class SubmitOrUpdateCreateTicketForm extends BaseForm {
    // update the values in the form
    handleForm = async (): Promise<AppCallResponse> => {
        return {
            type: AppCallTypes.FORM,
            form: await newCreateTicketForm(this.call),
        };
    }

    // submit the ticket
    handleSubmit = async (): Promise<AppCallResponse> => {
        let callResponse: AppCallResponse = {
            type: AppCallResponseTypes.OK,
        };

        try {
            const fieldErrors = await app.createTicketFromPost(this.call);

            // response with errors
            if (Object.keys(fieldErrors).length !== 0) {
                callResponse = {
                    type: AppCallResponseTypes.ERROR,
                    data: {
                        errors: fieldErrors,
                    },
                };
                return callResponse;
            }
        } catch (err) {
            callResponse = {
                type: AppCallResponseTypes.ERROR,
                error: err.message,
            };
        }

        return callResponse;
    }
}
