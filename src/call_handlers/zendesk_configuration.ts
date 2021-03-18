import {AppCallResponse} from 'mattermost-redux/types/apps';

import {newOKCallResponse, newFormCallResponse, newErrorCallResponseWithMessage} from '../utils/call_responses';
import {newZendeskConfigForm} from '../forms';
import {newConfigStore, AppConfigStore} from '../store/config';
import {BaseCallHandler} from '../utils/helper_classes/base_call_handler';

// OpenCreateTicketForm opens a new create ticket form
export class OpenZendeskConfigForm extends BaseCallHandler {
    handleSubmit = async (): Promise<AppCallResponse> => {
        const form = await newZendeskConfigForm(this.call);
        return newFormCallResponse(form);
    }
    handleForm = async (): Promise<AppCallResponse> => {
        const form = await newZendeskConfigForm(this.call);
        return newFormCallResponse(form);
    }
}

// SubmitOrUpdateCreateTicketForm updates the create ticket form with new values or
// submits the ticket if submit button is clicked
export class SubmitOrUpdateZendeskConfigForm extends BaseCallHandler {
    // update the values in the form
    handleForm = async (): Promise<AppCallResponse> => {
        const form = await newZendeskConfigForm(this.call);
        return newFormCallResponse(form);
    }

    // submit the ticket
    handleSubmit = async (): Promise<AppCallResponse> => {
        try {
            const context = this.call.context;
            const configStore = newConfigStore(context);
            const storeValues = this.call.values as AppConfigStore;
            configStore.storeConfigInfo(storeValues);
        } catch (err) {
            return newErrorCallResponseWithMessage(err.message);
        }

        return newOKCallResponse();
    }
}
