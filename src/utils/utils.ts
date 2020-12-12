module.exports.makeOption = (name) => ({label: name, value: name});
module.exports.makeOptions = (names) => names.map((name) => ({label: name, value: name}));
