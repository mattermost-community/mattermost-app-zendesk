import {AppSelectOption} from 'mattermost-redux/types/apps';

export const makeOption = (option) => ({label: option.name, value: option.value});
export const makeOptions = (options) => options.map(makeOption);

export const makeFormOption = (option) => ({label: option.name, value: option.id.toString()});
export const makeFormOptions = (options) => options.map(makeFormOption);

export const getMultiselectValue = (option: AppSelectOption) => option.value;
export const getMultiselectValues = (options) => options.map(getMultiselectValue);

export function errorWithMessage(err, message): string {
    return `"${message}".  ` + err.message;
}

export async function tryPromiseWithMessage(p: Promise<any>, message: string): Promise<any> {
    return p.catch((err) => {
        throw new Error(errorWithMessage(err, message));
    });
}
