const fetch = require('node-fetch');

class JiraClient {
    constructor(accessToken) {
        this.accessToken = accessToken;
    }

    async assignees(instanceID, projectID, search) {
        const host = this.getPluginRoute();
        const query = `instance_id=${encodeURIComponent(instanceID)}&project=${encodeURIComponent(projectID)}&q=${encodeURIComponent(search)}`;
        const u = `${host}/get-search-users?${query}`

        const res = await fetch(u, {
            headers: {
                Authorization: 'Bearer ' + this.accessToken,
            },
        }).then(r => r.json());

        const filtered = Array.from(new Set(res.map((user) => user.displayName))).map((name) => ({displayName: name}));

        return filtered;
    }

    getPluginRoute() {
        const host = process.env.MM_URL;
        return `${host}/plugins/jira/api/v2`;
    }
}

module.exports = JiraClient;
