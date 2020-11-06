# ZenDesk App

## Quick Start

* clone this repo
* cp `.env.save` `.env`
  * add your credentials to the `.env` file
* npm start

## Setup Mattermost Bot
  
### Install the app

`/apps install --url http://localhost:4000/mattermost/mattermost-app.json --app-secret thisisthesecret`

  The Mattermost Bot will be used to post messages to Mattermost.
  Authentications uses a Bot access token.

* `Channel Menu` > `Integrations` > `Bot Accounts` > `Add Bot Account`  
* Copy the Token after creating Bot and set as `MM_BOT_TOKEN` value in `.env`

* [ ] Automate this step?

## Create a ticket

EndPoint: `http://localhost:4000/mattermost/submission`  
Method: `post`  
Body (example):

```json
{
    "channel_id": "rgiqcxrm8jdjzgj536gb45oh3e",
    "user_id": "6fiyj9ni9t835dnbni1ddrj93y",
    "submission": {
        "post_id": "8dfjwummwfds8ptws3ha9ai6fr",
        "subject": "This is subject",
        "description": "This is description",
        "type": "incident"
    }
}
```

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

**Developer Notes:** When testing webhooks locally, you will need to expose your
localhost:4040 with ngrok

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

## Types

```typescript
export type AppletContext = {
  app_id: string;
  acting_user_id: string;
  user_id?: string;
  team_id?: string;
  channel_id: string;
  post_id?: string;
  root_post_id?: string;
    props?: {[name: string]: string};
};

export type AppletNotification = {
  Subject: string;
  Context: AppletContext;
};

```

## FAQ

### 1. `npm start` fails with warning about rudder in mattermost-redux

```sh
/Users/jfrerich/go/src/github.com/mattermost/plugins/mattermost-applet-zendesk/node_modules/rudder-sdk-js/index.js:8733
        var domain = ".".concat(lib(window.location.href));
```

* open `node_modules/mattermost-redux/client/rudder.js`
* comment out the following lines:

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

* open `node_modules/mattermost-redux/client/client4.js`
* comment out the following line:

```javascript
// var fetch_etag_1 = tslib_1.__importDefault(require("./fetch_etag"));
```

* add the following line:

```javascript
var fetch_etag_1 = require("node-fetch");
```
>>>>>>> Add instructions for target and trigger instructions
