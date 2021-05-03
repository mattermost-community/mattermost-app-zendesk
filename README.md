# ZenDesk App

**Maintainer:** [@jasonfrerich](https://github.com/jfrerich)

A Zendesk app for Mattermost.

This repository is licensed under the [Apache 2.0 License](https://github.com/mattermost/mattermost-plugin-github/blob/master/LICENSE).

## Table of Contents

 - [Admin Guide](#admin-guide)
    - [Setting up](#setting-up)
    - [Notification management](#notification-management)
    - [System Admin slash commands](#system-admin-slash-commands)
 - [User's Guide](#users-guide)
    - [Slash commands](#slash-commands)
    - [Create a ticket](#create-a-ticket)
 - [Development](#development)

## Admin Guide

This guide is intended for Mattermost System Admins setting up the Zendesk app, Mattermost users who want information about the app's functionality, and Mattermost users who want to connect their Zendesk account to Mattermost. For more information about contributing to this plugin, visit the [Development section](#development).

### Setting up

To configure and connect Zendesk with Mattermost, follow the steps below.

#### 1. Create a Zendesk OAuth client

Log in to Zendesk as System Admin to create a Zendesk OAuth client for Mattermost.

1. Go to **Zendesk > Admin > API > OAuth Clients**.
1. Select **Add OAuth Client**
    1. `Client Name`: (Example `Mattermost Zendesk App`)
    1. `Description`: `Connect your Zendesk account to Mattermost`
    1. `Redirect URLs`: `https://<mattermost-site-url>/plugins/com.mattermost.apps/apps/com.mattermost.zendesk/oauth2/remote/complete`
1. Select **Save**.

#### 2. Install the app in Mattermost

Next, log in to Mattermost as System Admin and run:

`/apps install --app-id com.mattermost.zendesk`

#### 3. Configure the Zendesk client in Mattermost

In Mattermost, as System Admin, run: `/zendesk configure` to open the configuration modal.

Use the values from the OAuth client set up step:

1. **URL:** Set to your Zendesk URL.
1. **Client ID:** Set to the **Unique identifier** OAuth value.
1. **Client Secret:** Set as the **Secret** OAuth value.
1. **OAuth2 Access Token:** Leave empty for now - you'll configure this once you're connected.

Select **Submit**.

#### 4. Connect your Zendesk account to Mattermost

1. Use `/zendesk connect` to connect your Mattermost user to your Zendesk account.
1. Select the connection link to authenticate your user.
1. Authenticate in Zendesk and close the broweser tab to complete the process.

#### 5. Set up subscriptions

This step requires a Zendesk-connected Mattermost user and uses an access token needed for subscriptions functionality. The token can be any connected Zendesk user with agent permissions in Zendesk. Another option is to create a bot agent user in Zendesk, that will function as a service account, and connect them to Mattermost.

Note, the access token is only used to read ticket information when a subcription is triggered. This token will not post on behalf of the user.

1. `/zendesk me` - Save this access token value.
1. `/zendesk configure`:
    1. `Oauth2 Access Token` - Set this value to the token saved in the step above and select **Submit**.
1. `/zendesk setup-target` - This command will set up a Zendesk target pointing to your Mattermost instance (it only needs to be run once).
1. An ephemeral post will confirm that a target was created and that subscriptions functionality has been configured.

## Notification management

Subscriptions to Zendesk events can be added via the channel header, post menu, or using a slash command. Each subscription creates a [Zendesk Trigger](https://developer.zendesk.com/rest_api/docs/support/triggers). A trigger consists of one or more actions performed when a ticket is created or updated. The actions are performed only if certain conditions are met. For example, a trigger can notify the customer when an agent changes the status of a ticket to Solved.

Triggers send a notification based on specified conditions. Subscriptions currently support the `changed` action on a limited number of fields, but will have enhancements in the future.

Zendesk Admins are able to view these subscriptions inside Zendesk via **Settings > Business Rules > Triggers** and all generated Mattermost Zendesk App Trigger names are prefixed with `__mm_webhook__`. After creating a notification from Mattermost, you can access the trigger in Zendesk and modify conditions of the trigger. If an unsupported condition is added, the user will be notified through Mattermost and a link will be provided to the Zendesk trigger where it can be further modified.

### System Admin slash commands

`/zendesk configure` - Configure the Zendesk app after installation.
`/zendesk setup-target` - Set up the Zendesk target for your instance.
`/zendesk subscribe` - Setu p a channel subscription.

## User's Guide

Connect your Zendesk account to Mattermost using:

`/zendesk connect`

This slash command connects your Mattermost and Zendesk accounts via OAuth2 authorization.

### Slash commands

- `/zendesk connect` - Connect your Zendesk account to Mattermost.
- `/zendesk disconnect` - Disconnect your Zendesk account from Mattermost.
- `/zendesk help` - Post ephemeral message with help text.
- `/zendesk me` - Post ephemeral message with your connection information.

 ## Create a ticket

Creating a ticket from a Mattermost post is done through the `...` post menu button

![create ticket](./docs/create-ticket.gif)

## Development

To install Zendesk in a development environment:

`/apps debug-add-manifest --url http://localhost:4000/manifest.json`  
`/apps install --app-id com.mattermost.zendesk --app-secret thisisthesecret`

Start the node server

1. `make watch` - (to monitor typescript errors and watch changing files errors)
1. `make run` - (in a separate shell) start the node server

## Provision

To provision this app to AWS run `make dist` to generate the App bundle and then follow the steps [here](https://github.com/mattermost/mattermost-plugin-apps#provisioning).

## Troubleshooting

### Log message received and binding locations do not show

The System Admin has turned off OAuth2 Service Provider. The OAuth2 service needs to be turned on in `config/config.json`:

```json
"EnableOAuthServiceProvider": true,
```

This can also be done in **System Console > Enable OAuth2 Service Provider**.
