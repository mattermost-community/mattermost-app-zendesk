import Client from 'mattermost-redux/client/client4.js';
const client = new Client();

const url = process.env.MM_SITEURL || 'http://localhost:8065';
client.setUrl(url);

// export default (token) => client.setToken(token);
export default client
