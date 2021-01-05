# ZenDesk App

## Development Repository Branches Needed

The current master branches have not been merged to work with this app and the following are needed until they are merged with master

mm-webapp: `feature/cloud-apps`  
mm-plugin-apps: `master`

## Quick Start

### Zendesk and Mattermost Users (System Admin privileges required)

1. Clone this repo
1. cp `.env.sample` `.env`
    1. `ZENDESK_URL` - set URL to your zendesk account host
        1. Ex. `https://<subdomain>.zendesk.com`
    1. `ZENDESK_CLIENT_SECRET` - (will be set later in the setup)
1. Create Zendesk Oauth Client for Mattermost (in Zendesk)
    1. `Zendesk` > `Admin` > `API` > `OAuth Clients`
    1. `Add OAuth Client`
        1. `Client Name`: `Mattermost Zendesk App`
        1. `Description`: `Connect your Zendesk to accout to Mattermost`
        1. `https://<your-zendesk-app-host>/mattermost/oauth/complete`
            1. Ex. `https://localhost:4000` - Development
            1. Ex. `https://mytest.ngrok.io` - Exposed for development
        1. `Secret` - Save the generated secret in `.env` as the `ZENDESK_CLIENT_SECRET`
        1. `Save`
1. Start the node server
    1. `npm start` - start the node server
    1. `npm run build` - builds the dist dir.  (TODO: can this be automated?  Fails if this is not run before `npm start`)
    1. `npm run build:watch` (in separate shell) - watch for changing files and report typescript errors
1. Install the app (In Mattermost)
    1. `/apps install --url http://<your-zendesk-app-host>/mattermost/manifest.json --app-secret thisisthesecret`  
        1. TODO this command could be used to set zendesk-url and zendesk-client-secret

### Zendesk and Mattermost Users (All users)

#### Connect your Zendesk account to Mattermost

- `/zendesk connect`

This slash command will allow a user to connect their Mattermost and Zendesk
accounts via OAuth2 authorization

## Slash Commands

`/zendesk connect` - connect your Zendesk account to Mattermost
`/zendesk disconnect` - disconnect your Zendesk account from Mattermost

## Create a ticket

Creating a ticket from a Mattermost post is done through the `...` post menu button

### Installing the app

`/apps install --url http://<your-zendesk-app>/mattermost/manifest.json --app-secret thisisthesecret`  
`/apps install --url http://localhost:4000/mattermost/manifest.json --app-secret thisisthesecret`  

  After installing the app, a provisioned bot account will be created for user @zendesk and posted in a DM.

  The following values are stored locally in `config.json`

- `bot_access_token`
- `oauth2_client_secret`

## Setup Zendesk Webhooks

Here is a helpful [Zendesk post](https://support.zendesk.com/hc/en-us/articles/204890268-Creating-webhooks-with-the-HTTP-target#topic_yf1_fs5_tr) describing the setup of webhooks

### Add a notification target

From [Zendesk Documentation:](https://developer.zendesk.com/rest_api/docs/support/targets)

> Targets are pointers to cloud-based applications and services such as Twitter and Twilio, as well as to HTTP and email addresses. You can use targets with triggers and automations to send a notification to the target when a ticket is created or updated.

Because the we are sending notifying the cloud app of Zendesk triggered events,
we will need to add an HTTP target which will accept the webhook notifications.

1. Click the Admin icon (sprocket) in the left sidebar
1. `Settings` > `Extensions`
1. `Targets tab` > `Add Target`
1. Select `HTTP` Target
1. Fill in the following:
    1. **Title:** Send Mattermost notification when ticket created
    1. **Url:** `<your_url/zendesk/webhook>`
    1. **Method:** POST
    1. **Content Type:** JSON

**Developer Notes:** When testing webhooks locally, you will need to expose your localhost:4040 with ngrok

### Add a trigger when new ticket is created

From [Zendesk Documentation:](https://developer.zendesk.com/rest_api/docs/support/triggers)

> A trigger consists of one or more actions performed when a ticket is created or updated. The actions are performed only if certain conditions are met. For example, a trigger can notify the customer when an agent changes the status of a ticket to Solved.

1. Click the Admin icon (sprocket) in the left sidebar
1. `Settings` > `Business Rules` > `Triggers` > `Add trigger`
1. Fill in the following:
    1. **Trigger Name:** Notify Mattermost App when ticket created
    1. **Description:** When a new ticket is created, trigger a notification and send to Mattermost zendesk cloud app
    1. **Conditions:**
        1. Under "Meet ALL of the following conditions"
        1. `Ticket` `Is` `Created`
    1. **Actions:**
        1. In the first select box choose `Notify target`
        1. In the second select box choose `Send notification when ticket
           created`
        1. Past the following in the JSON Body textarea.

```json
{
  "title": "{{ticket.title}}",
  "ticketUrl": "{{ticket.url}}",
  "ticketDescription": "{{ticket.description}}",
  "ticketID": "{{ticket.id}}",
  "ticketPriority": "{{ticket.priority}}",
  "ticketRequester": "{{ticket.requester.details}}",
  "ticketType": "{{ticket.ticket_type}}"
}
```

## FAQ

### 1. `npm start` fails with warning about rudder in mattermost-redux

```sh
.../mattermost-app-zendesk/node_modules/rudder-sdk-js/index.js:8733
        var domain = ".".concat(lib(window.location.href));
```

- open `node_modules/mattermost-redux/client/rudder.js`
- comment out the following lines:

```javascript
var rudderAnalytics = tslib_1.__importStar(require("rudder-sdk-js"));
exports.rudderAnalytics = rudderAnalytics;
```

### 2.  fails with warning about rudder in mattermost-redux

```sh
(node:45576) UnhandledPromiseRejectionWarning: ReferenceError: fetch is not defined
    at Object.exports.default (/Users/jfrerich/go/src/github.com/mattermost/plugins/mattermost-applet-zendesk/node_modules/mattermost-redux/client/fetch_etag.js:32:26)
    at Client4.<anonymous> (/Users/jfrerich/go/src/github.com/mattermost/plugins/mattermost-applet-zendesk/node_modules/mattermost-redux/client/client4.js:1594:70)
```

- open `node_modules/mattermost-redux/client/client4.js`
- comment out the following line:

```javascript
// var fetch_etag_1 = tslib_1.__importDefault(require("./fetch_etag"));
```

- add the following line:

```javascript
var fetch_etag_1 = require("node-fetch");
```

### 3. Log message received

`The system admin has turned off OAuth2 Service Provider.`

Oauth2 service needs to be turned on in `config/config.json`

```json
"EnableOAuthServiceProvider": true,
```
