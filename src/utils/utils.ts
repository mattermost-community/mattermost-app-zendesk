interface iOption {label: string; value: string}
export function makeOption(name: string): iOption {
    return ({label: name, value: name});
}

export function makeOptions(names: string[]): iOption[] {
    return names.map((name: string) => ({label: name, value: name}));
}
