const zendesk = require('node-zendesk');

function newClient() {
  const username = process.env.ZENDESK_USERNAME;
  const token = process.env.ZENDESK_API_TOKEN;
  const apiURL = process.env.ZENDESK_URL + '/api/v2'

  return zendesk.createClient({
    username:  username,
    token:     token,
    remoteUri: apiURL
  });
}

module.exports = newClient()
