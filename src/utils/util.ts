import fetch from 'node-fetch';

module.exports.openInteractiveDialog = async (dialog) => {
    const host = process.env.MM_URL || 'http://localhost:8065';
    const u = `${host}/api/v4/actions/dialogs/open`;

    // console.log(JSON.stringify(dialog));
    const res = await fetch(u, { method: 'POST', body: JSON.stringify(dialog) }).then((r) => r.json());
    return res.json();
};

module.exports.makeOption = (name) => ({ text: name, value: name });
module.exports.makeOptions = (names) => names.map((name) => ({ text: name, value: name }));