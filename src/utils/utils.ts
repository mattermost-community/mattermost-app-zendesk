import fetch from 'node-fetch';

module.exports.makeOption = (name) => ({text: name, value: name});
module.exports.makeOptions = (names) => names.map((name) => ({text: name, value: name}));

export function getStaticSelectOptions(values: string[]): AppSelectOption[] {
    const options: Array<AppSelectOption> = [];
    for (const key of values) {
        options.push({label: key, value: key});
    }
    return options;
}
