import {AppCallResponse} from 'mattermost-redux/types/apps';

import {newOKCallResponse, newOKCallResponseWithMarkdown, newFormCallResponse, newErrorCallResponseWithMessage, newErrorCallResponseWithFieldErrors} from '../utils/call_responses';

import {newSubscriptionsForm} from '../forms';

import {BaseCallHandler} from '../utils/helper_classes/base_call_handler';

import {newApp} from '../app/app';

// OpenSubscriptionsForm opens a new subscriptions form
export class OpenSubscriptionsForm extends BaseCallHandler {
    handleSubmit = async (): Promise<AppCallResponse> => {
        const form = await newSubscriptionsForm(this.call);
        return newFormCallResponse(form);
    }
}

// SubmitOrUpdateSubscriptionsForm updates the subscriptions form with new values or
// submits the the form if submit button is clicked
export class SubmitOrUpdateSubscriptionsForm extends BaseCallHandler {
    // update the values in the form
    handleForm = async (): Promise<AppCallResponse> => {
        const form = await newSubscriptionsForm(this.call);
        return newFormCallResponse(form);
    }

    // create the subscription
    handleSubmit = async (): Promise<AppCallResponse> => {
        const app = newApp(this.call);
        const callResponse = await app.createZDSubscription();
        return callResponse;
    }
}
