import fetch from 'node-fetch';

const host = process.env.MM_URL || 'http://localhost:8065';
const pathPrefix = `${host}/plugins/com.mattermost.apps`;

const pathInstall = `${pathPrefix}/install`;
const pathSubscribe = `${pathPrefix}/subscribe`;
const pathConnectedInstall = `${pathPrefix}/connected_install`;

// http constains methods for handling requests to and from the
// mattermost-plugin-apps API
class MattermostPluginHTTP {
    async installApp() {
        // console.log(JSON.stringify(dialog));
        // const res = await fetch(u, {method: 'POST', body: JSON.stringify(dialog)}).then(r => r.json());
        // return res.json();
        const opts = {
            method: 'POST',
            headers: {
                Authorization: 'Basicjunkencoded',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify('junk'),
        };

        const r = await fetch(pathInstall, opts);
    }

    async installConnectectInstall() {
        // console.log(JSON.stringify(dialog));
        // const res = await fetch(u, {method: 'POST', body: JSON.stringify(dialog)}).then(r => r.json());
        // return res.json();
        const opts = {
            method: 'POST',
            headers: {
                Authorization: 'Basicjunkencoded',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify('junk'),
        };

        const r = await fetch(pathInstall, opts);
    }

    async subscribe() {
        // console.log(JSON.stringify(dialog));
        // const res = await fetch(u, {method: 'POST', body: JSON.stringify(dialog)}).then(r => r.json());
        // return res.json();
        const opts = {
            method: 'POST',
            headers: {
                Authorization: 'Basicjunkencoded',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify('junk'),
        };

        const r = await fetch(pathSubscribe, opts);
    }
}

export default new MattermostPluginHTTP();
