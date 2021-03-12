import {AppCall, AppCallResponse} from 'mattermost-redux/types/apps';
import {AppCallTypes} from 'mattermost-redux/constants/apps';

// BaseCallHandler is the base class for all call handlers. Each call handler
// implements this class which routes the call type to its corresponding method
export class BaseCallHandler {
    call: AppCall

    constructor(call: AppCall) {
        this.call = call;
    }

    // handle delegates form handling based on AppCall type
    handle = (): Promise<AppCallResponse> => {
        switch (this.call.type) {
        case AppCallTypes.FORM:
            return this.handleForm();
        case AppCallTypes.LOOKUP:
            return this.handleLookup();
        case AppCallTypes.SUBMIT:
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
