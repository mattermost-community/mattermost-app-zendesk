import {AppCallResponseTypes, AppCallTypes} from 'mattermost-redux/constants/apps';
import {AppCall, AppCallResponse} from 'mattermost-redux/types/apps';

import {getManifest} from '../../manifest';

import app from '../app/app';

import {newCreateTicketForm} from './create_ticket';

// BaseForm routes the call type to its corresponding method
export class BaseForm {
    call: AppCall

    constructor(call: AppCall) {
        this.call = call;
    }

    // get query param to determine post_menu or modal submit
    handle = (): Promise<AppCallResponse> => {
        const fullURL = getManifest().root_url + this.call.url;
        const url = new URL(fullURL);
        const callType = url.searchParams.get('call_type');

        // a field value in the form has changed
        if (this.call.values) {
            if (this.call.type === AppCallTypes.FORM && this.call.values.name) {
                return this.handleForm();
            }
        }

        switch (callType) {
        case 'open':
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

// CreateTicketForm handles creation and submission for creating a ticket from a post
export class CreateTicketForm extends BaseForm {
    handleForm = async (): Promise<AppCallResponse> => {
        const form = await newCreateTicketForm(this.call);
        const callResponse: AppCallResponse = {
            type: AppCallTypes.FORM,
            form,
        };
        return callResponse;
    }

    handleSubmit = async (): Promise<AppCallResponse> => {
        let callResponse: AppCallResponse = {
            type: AppCallResponseTypes.OK,
        };

        try {
            await app.createTicketFromPost(this.call);
        } catch (err) {
            callResponse = {
                type: AppCallResponseTypes.ERROR,
                error: err.message,
            };
        }
        return callResponse;
    }
}
