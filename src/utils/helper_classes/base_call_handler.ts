import {AppCall, AppCallResponse} from 'mattermost-redux/types/apps';

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
