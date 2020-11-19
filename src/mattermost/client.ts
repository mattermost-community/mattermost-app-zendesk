import Client from 'mattermost-redux/client/client4.js';
const client = new Client();

const url = process.env.MM_SITEURL || 'http://localhost:8065';
client.setUrl(url);
client.setToken(process.env.MM_BOT_TOKEN);

export default client;
