const fetch = require('node-fetch');

module.exports.openInteractiveDialog = async (dialog) => {
    const host = process.env.MM_URL || 'http://localhost:8065';
    const u = `${host}/api/v4/actions/dialogs/open`;
    const res = await fetch(u, {method: 'POST', body: JSON.stringify(dialog)}).then(r => r.json());
    return res.json();
}
