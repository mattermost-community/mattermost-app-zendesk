import {AppCallResponse, AppForm} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

export type FieldValidationErrors = {[name: string]: string};

export function newOKCallResponse(): AppCallResponse {
    return {
        type: AppCallResponseTypes.OK,
    };
}

export function newOKCallResponseWithMarkdown(markdown: string): AppCallResponse {
    return {
        type: AppCallResponseTypes.OK,
        markdown,
    };
}

export function newOKCallResponseWithData(data: {}): AppCallResponse {
    return {
        type: AppCallResponseTypes.OK,
        data,
    };
}

export function newFormCallResponse(form: AppForm): AppCallResponse {
    return {
        type: AppCallResponseTypes.FORM,
        form,
    };
}

export function newErrorCallResponseWithMessage(error: string): AppCallResponse {
    return {
        type: AppCallResponseTypes.ERROR,
        error,
    };
}

export function newErrorCallResponseWithFieldErrors(errors: FieldValidationErrors): AppCallResponse {
    return {
        type: AppCallResponseTypes.ERROR,
        data: {
            errors,
        },
    };
}
