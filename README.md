# ZenDesk App

## Quick Start

### Zendesk and Mattermost Users (System Admin privileges required)

1. Clone this repo
1. Create Zendesk Oauth Client for Mattermost (in Zendesk)
    1. `Zendesk` > `Admin` > `API` > `OAuth Clients`
    1. `Add OAuth Client`
        1. `Client Name`: (Example `Mattermost Zendesk App`)
        1. `Description`: `Connect your Zendesk account to Mattermost`
        1. `Redirect URLs`: `https://<your-zendesk-app-host>/oauth/complete`
            1. Ex. `http://localhost:4000` - Development
            1. Ex. `https://mytest.ngrok.io` - Exposed for development
        1. `Save`
1. Install the app (In Mattermost)
    1. `/apps install --url http://<your-zendesk-app-host>/manifest.json --app-secret thisisthesecret`  
1. Configure Zendesk Client in Mattermost
    1. `/zendesk configure` to open the configuration modal
    1. Save values from Oauth Client form to the fields in the configuration modal
        1. `Zendesk URL` - set to your zendesk account host
        1. `Zendesk Client ID` - set to the `Unique identifier` field value
        1. `Zendesk Client Secret` - set as the `Secret` field value
            1. Ex. `https://<subdomain>.zendesk.com`
        1. `ZD_NODE_HOST` - set to the path of your zendesk app host
            1. Ex. `https://testing.ngrok.io`
1. [Setup Zendesk Target](#Setup Zendesk Target)
1. Start the node server
    1. `make watch` - (to monitor typescript errors and watch changing files errors)
    1. `make run` - (in a separate shell) start the node server

### Zendesk and Mattermost Users (All users)

#### Connect your Zendesk account to Mattermost

- `/zendesk connect`

This slash command will allow a user to connect their Mattermost and Zendesk
accounts via OAuth2 authorization

## Slash Commands

`/zendesk connect` - connect your Zendesk account to Mattermost  
`/zendesk configure` - configure the Zendesk app after installation  
`/zendesk disconnect` - disconnect your Zendesk account from Mattermost  
`/zendesk help` - post ephemeral message with help text

## Create a ticket

Creating a ticket from a Mattermost post is done through the `...` post menu button

![create ticket](./assets/create-ticket.gif)

## Subscribe a Channel to Notifications

Subscriptions to Zendesk events can be added via the `channel header`, `post menu`, or `slash command`. Each subscription creates a [Zendesk Trigger](https://developer.zendesk.com/rest_api/docs/support/triggers) which will send a notification based on specified conditions.  Subscriptions currently support the `changed` action on a limited number of fields, but will have enhancements in the future.

The definition of a Trigger is defined below:
> A trigger consists of one or more actions performed when a ticket is created or updated. The actions are performed only if certain conditions are met. For example, a trigger can notify the customer when an agent changes the status of a ticket to Solved.

Zendesk Admins are able to view these subscriptions inside Zendesk via `Settings` > `Business Rules` > `Triggers` and all generated Mattermost Zendesk App Trigger names are prefixed with `__mm_webhook__`.  After creating a notification from Mattermost, it is possible to access the trigger in Zendesk and modify conditions of the trigger. If a conditions is added that is not currently supported by the Mattermost Zendesk App, the user will be notificed when trying to edit the subscription through Mattemrost and a link will be provided to the Zendesk trigger where it can be further modified.

## Installation

`/apps install --url http://<your-zendesk-app>/manifest.json --app-secret thisisthesecret`  
`/apps install --url http://localhost:4000/manifest.json --app-secret thisisthesecret`  

## Setup Zendesk Target

Here is a helpful [Zendesk post](https://support.zendesk.com/hc/en-us/articles/204890268-Creating-webhooks-with-the-HTTP-target#topic_yf1_fs5_tr) describing the setup of webhooks

### Add a notification target

From [Zendesk Documentation:](https://developer.zendesk.com/rest_api/docs/support/targets)

> Targets are pointers to cloud-based applications and services such as Twitter and Twilio, as well as to HTTP and email addresses. You can use targets with triggers and automations to send a notification to the target when a ticket is created or updated.

We need to create the Zendesk HTTP target which will send webhook trigger notifications to the Zendesk app.  Each Zendesk trigger event will send a notficication to this target. We only need one target per Mattermost instance.

1. Click the Admin icon (sprocket) in the left sidebar
1. `Settings` > `Extensions`
1. `Targets tab` > `Add Target`
1. Select `HTTP` Target
1. Fill in the following:
    1. **Title:** Mattermost target for incoming webhooks
    1. **Url:** `<node_host_url>/webhook-incoming>`
    1. **Method:** POST
    1. **Content Type:** JSON
1. Test that the target is valid
    1. Select `Test target` in the dropdown
    1. Click `Submit` button
    1. Leave JSON body in the floating window empty
    1. Click `Submit` button in floating window
    1. Verify `HTTP/1.1 200 OK` response is shown in the resulting window
1. Save the valid target
    1. Select `Create target` in the dropdown
    1. Click `Submit` button

**Developer Notes:** When testing webhooks locally, you will need to expose your localhost:4040 with ngrok

## Provision

To provision this PR to AWS run `make dist` to generate the App bundle and then follow the steps [here](https://github.com/mattermost/mattermost-plugin-apps#provisioning).

## FAQ

### 1. Log message received and binding locations do not show

`The system admin has turned off OAuth2 Service Provider.`

Oauth2 service needs to be turned on in `config/config.json`
Through system console -> enable oauth2 service provider

```json
"EnableOAuthServiceProvider": true,
```
