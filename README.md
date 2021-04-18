# ZenDesk App

## Quick Start

### Zendesk and Mattermost Users (System Admin privileges required)

##### 1. Create Zendesk Oauth Client for Mattermost (in Zendesk)

1. `Zendesk` > `Admin` > `API` > `OAuth Clients`
1. `Add OAuth Client`
    1. `Client Name`: (Example `Mattermost Zendesk App`)
    1. `Description`: `Connect your Zendesk account to Mattermost`
    1. `Redirect URLs`: `https://<mattermost-site-url>/plugins/com.mattermost.apps/apps/com.mattermost.zendesk/oauth2/remote/complete`
    1. `Save`

##### 2. Install the app (In Mattermost)

1. `/apps install --app-id com.mattermost.zendesk --app-secret thisisthesecret`

##### 3. Configure Zendesk Client in Mattermost

`/zendesk configure` to open the configuration modal

Insert values from Oauth Client setup (step 1) fields in the configuration modal

1. `URL` - set to your zendesk URL
1. `Client ID` - set to the `Unique identifier` Oauth value
1. `Client Secret` - set as the `Secret` Oauth value
1. `Oauth2 Access Token` - leave empty for now (You will configure this once you are connected)
1. click `Submit`

`/zendesk connect` to connect to Mattermost to your Zendesk account

##### 4. Setup Subscriptions

This step requires a Zendesk connected Mattermost user and uses an access token needed for subscriptions integration.  The token can be any connected Zendesk user with agent permissions in Zendesk.  Another option is to create a "bot" agent user in Zendesk and connect them to mattermost.

Note, the access token is only used to read ticket information when a subcription is triggered.  This token will not post on behalf of the user.

1. `/zendesk me` - save this access token value
1. `/zendesk configure`
    1. `Oauth2 Access Token` - set this value to the token saved in the step above
1. `/zendesk setup-target` - this command will setup a zendesk target pointing to your mattermost instance (it only needs to be run one time)

##### 5. Start the node server

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
`/zendesk me` - post ephemeral message with your connection information  
`/zendesk subscribe` - setup a channel subscription  

## Create a ticket

Creating a ticket from a Mattermost post is done through the `...` post menu button

![create ticket](./docs/create-ticket.gif)

## Subscribe a Channel to Notifications

Subscriptions to Zendesk events can be added via the `channel header`, `post menu`, or `slash command`. Each subscription creates a [Zendesk Trigger](https://developer.zendesk.com/rest_api/docs/support/triggers) which will send a notification based on specified conditions.  Subscriptions currently support the `changed` action on a limited number of fields, but will have enhancements in the future.

The definition of a Trigger is defined below:
> A trigger consists of one or more actions performed when a ticket is created or updated. The actions are performed only if certain conditions are met. For example, a trigger can notify the customer when an agent changes the status of a ticket to Solved.

Zendesk Admins are able to view these subscriptions inside Zendesk via `Settings` > `Business Rules` > `Triggers` and all generated Mattermost Zendesk App Trigger names are prefixed with `__mm_webhook__`.  After creating a notification from Mattermost, it is possible to access the trigger in Zendesk and modify conditions of the trigger. If a conditions is added that is not currently supported by the Mattermost Zendesk App, the user will be notificed when trying to edit the subscription through Mattemrost and a link will be provided to the Zendesk trigger where it can be further modified.

## Installation

### In Production

`/apps install --app-id com.mattermost.zendesk`

### In Development

`/apps debug-add-manifest --url http://localhost:4000/manifest.json`  
`/apps install --app-id com.mattermost.zendesk --app-secret thisisthesecret`

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
