export const makeOption = (name: string) => ({label: name, value: name});
export const makeOptions = (names: string[]) => names.map(makeOption);

export function errorWithMessage(err, message): string {
    return `"${message}".  ` + err.message;
}
