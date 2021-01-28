import {AppSelectOption} from 'mattermost-redux/types/apps';

type zdFieldOption = {
    name: string;
    value: string;
}

type zdFormFieldOption = {
    name: string;
    id: number;
}

export const makeOption = (option: zdFieldOption): AppSelectOption => ({label: option.name, value: option.value});
export const makeOptions = (options: zdFieldOption[]): AppSelectOption[] => options.map(makeOption);

export const makeFormOption = (option: zdFormFieldOption): AppSelectOption => ({label: option.name, value: option.id.toString()});
export const makeFormOptions = (options: zdFormFieldOption[]): AppSelectOption[] => options.map(makeFormOption);

export const getMultiselectValue = (option: zdFieldOption): string => option.value;
export const getMultiselectValues = (options: zdFieldOption[]): string[] => options.map(getMultiselectValue);

export function errorWithMessage(err, message: string): string {
    return `"${message}".  ` + err.message;
}

export async function tryPromiseWithMessage(p: Promise<any>, message: string): Promise<any> {
    return p.catch((err) => {
        throw new Error(errorWithMessage(err, message));
    });
}
