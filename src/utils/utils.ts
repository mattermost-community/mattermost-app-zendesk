module.exports.makeOption = (name: string) => ({label: name, value: name});
module.exports.makeOptions = (names: string[]) => names.map((name: string) => ({label: name, value: name}));
