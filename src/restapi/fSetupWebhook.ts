import {AppExpandLevels} from '../constants/apps';

import {AppCallResponse, CtxExpandedBotAppActingUserOauth2AppOauth2User} from 'types/apps';

import {Routes, tryPromiseWithMessage} from '../utils';
import {isZdAdmin, webhookConfigured} from '../utils/utils';

import {Webhook} from 'clients/zendesk/types';
import {newConfigStore} from '../store';
import {CallResponseHandler, newErrorCallResponseWithMessage, newOKCallResponseWithMarkdown} from '../utils/call_responses';

export const expandSetupWebhook = {
    app: AppExpandLevels.EXPAND_SUMMARY,
    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
};

export const fSetupWebhook: CallResponseHandler = async (req, res) => {
    const context = req.body.context;

    let callResponse: AppCallResponse;
    try {
        const text = await updateOrCreateWebhook(context);
        callResponse = newOKCallResponseWithMarkdown(text);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to create Zendesk webhook: ' + error.message);
    }
    res.json(callResponse);
};

// updateOrCreateWebhook creates a webhook or updates an the exising webhook
async function updateOrCreateWebhook(context: CtxExpandedBotAppActingUserOauth2AppOauth2User): Promise<string> {
    if (!context.oauth2) {
        throw new Error('failed to get oauth2 user');
    }

    const oauth2User = context.oauth2.user;
    if (!isZdAdmin(oauth2User.role)) {
        return 'only Zendesk admins can create webhooks in Zendesk';
    }

    const config = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    const cValues = await config.getValues();
    const siteUrl = context.mattermost_site_url;
    const url = getIncomingWebhookUrl(context);

    const webhook: Webhook = {
        id: '',
        name: 'Mattermost Subscriptions ' + siteUrl,
        endpoint: url,
        description: 'Webhook for the Mattermost Zendesk App',
        http_method: 'POST',
        request_format: 'json',
        status: 'active',
        subscriptions: ['conditional_ticket_events'],
    };

    // Add the user access_token to the store
    if (oauth2User?.token?.access_token) {
        cValues.zd_oauth_access_token = oauth2User.token.access_token;
    } else {
        throw new Error('failed to get oauth2 user access_token');
    }

    const host = cValues.zd_url;

    // Update the existing webhook
    if (webhookConfigured(cValues)) {
        const id = cValues.zd_webhook_id;

        const link = `[Zendesk webhook](${host}/admin/apps-integrations/webhooks/webhooks/${id}/details)`;

        // Reuse the saved webhookID. Failing to do so will invalidate all previously created triggers attached to the previous webhookID
        webhook.id = id;
        const updateReq = createZendeskWebhook(host, cValues.zd_oauth_access_token, webhook, 'PATCH');
        await tryPromiseWithMessage(updateReq, 'Failed to update Zendesk webhook');

        await config.storeConfigInfo(cValues);
        return `Successfully updated ${link}`;
    }

    // Create the webhook
    const createReq = createZendeskWebhook(host, cValues.zd_oauth_access_token, webhook, 'POST');
    const zdWebhook = await tryPromiseWithMessage(createReq, 'Failed to create Zendesk webhook');

    cValues.zd_webhook_id = zdWebhook.webhook.id;

    const link = `[Zendesk webhook](${host}/admin/apps-integrations/webhooks/webhooks/${cValues.zd_webhook_id}/details)`;

    // Save the webhook id
    await config.storeConfigInfo(cValues);
    return `Successfully created ${link}`;
}

function getIncomingWebhookUrl(context: CtxExpandedBotAppActingUserOauth2AppOauth2User): string {
    const whSecret = context.app.webhook_secret;
    const appID = 'zendesk';

    const whPath = Routes.App.SubscribeIncomingWebhookPath;
    let url = context.mattermost_site_url;
    url += `/plugins/com.mattermost.apps/apps/${appID}${whPath}?secret=`;
    url += whSecret;
    return url;
}

const createZendeskWebhook = async (zendeskURL: string, token: string, webhook: Webhook, method: string): Promise<{webhook: Webhook}> => {
    let url = zendeskURL + '/api/v2/webhooks';
    if (webhook.id) {
        url += '/' + webhook.id;
    }

    const options = {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'node-zendesk (node/16.4.0)',
            Authorization: `Bearer ${token}`,
        },
        method,
        body: JSON.stringify({
            webhook,
        }),
    };

    const res = await fetch(url, options);

    if (method === 'PATCH') {
        return {webhook};
    }

    const text = await res.text();
    if (!text) {
        throw new Error('Received empty response from Zendesk');
    }

    return JSON.parse(text);
};
