export function getStaticSelectOptions(values: string[]): AppSelectOption[] {
    const options: Array<AppSelectOption> = [];
    for (const key of values) {
        options.push({label: key, value: key});
    }
    return options;
}
