import fetch from 'node-fetch';

module.exports.makeOption = (name) => ({text: name, value: name});
module.exports.makeOptions = (names) => names.map((name) => ({text: name, value: name}));
