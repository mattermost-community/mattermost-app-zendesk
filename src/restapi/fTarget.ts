import {AppCallResponse} from 'mattermost-redux/types/apps';

import {getManifest} from '../manifest';
import {Routes, tryCallResponseWithMessage, tryPromiseWithMessage} from '../utils';
import {isZdAdmin, webhookConfigured} from '../utils/utils';
import {ZDClient, newZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {newConfigStore} from '../store';
import {CallResponseHandler, newErrorCallResponseWithMessage, newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {CtxExpandedBotAppActingUserOauth2AppOauth2User} from 'types/apps';

export const fCreateTarget: CallResponseHandler = async (req, res) => {
    const context = req.body.context;
    const zdOptions: ZDClientOptions = {
        oauth2UserAccessToken: context.oauth2.user.token.access_token,
        botAccessToken: context.bot_access_token,
        mattermostSiteUrl: context.mattermost_site_url,
    };
    const zdClient = await newZDClient(zdOptions);
    await tryCallResponseWithMessage(
        updateOrCreateTarget(zdClient, context).then((text) => {
            const callResponse = newOKCallResponseWithMarkdown(text);
            res.json(callResponse);
        }),
        'Unable to create target',
        res
    );
};

// updateOrCreateTarget creates a target or updates an the exising target
async function updateOrCreateTarget(zdClient: ZDClient, context: CtxExpandedBotAppActingUserOauth2AppOauth2User): Promise<string> {
    if (!context.oauth2) {
        throw new Error('failed to get oauth2 user');
    }

    const oauth2User = context.oauth2.user;
    if (!isZdAdmin(oauth2User.role)) {
        return 'only Zendesk admins can create targets in Zendesk';
    }

    const config = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    const cValues = await config.getValues();
    const siteUrl = context.mattermost_site_url;
    const url = getTargetUrl(context);
    const payload = {
        target: {
            id: '',
            type: 'http_target',
            method: 'post',
            content_type: 'application/json',
            title: 'Mattermost Subcriptions ' + siteUrl,
            target_url: url,
        },
    };

    // Add the user access_token to the store
    if (oauth2User.token && oauth2User.token.access_token) {
        cValues.zd_oauth_access_token = oauth2User.token.access_token;
    } else {
        throw new Error('failed to get oauth2 user access_token');
    }

    const host = cValues.zd_url;
    const link = '[Zendesk target](' + host + '/agent/admin/extensions)';

    // Update the existing target
    if (webhookConfigured(cValues)) {
        const id = cValues.zd_target_id;

        // Reuse the saved targetID. Failing to do so will invalidate all previously created triggers attached to the previous targetID
        payload.target.id = id;
        const createReq = zdClient.targets.update(id, payload);
        await tryPromiseWithMessage(createReq, 'Failed to update Zendesk target');
        await config.storeConfigInfo(cValues);
        return `Successfully updated ${link}`;
    }

    // Create the target
    const createReq = zdClient.targets.create(payload);
    const zdTarget = await tryPromiseWithMessage(createReq, 'Failed to create Zendesk target');
    cValues.zd_target_id = zdTarget.id;

    // Save the targetID
    await config.storeConfigInfo(cValues);
    return `Successfully created ${link}`;
}

function getTargetUrl(context: CtxExpandedBotAppActingUserOauth2AppOauth2User): string {
    const whSecret = context.app.webhook_secret;
    const pluginName = getManifest().app_id;
    const whPath = Routes.App.SubscribeIncomingWebhookPath;
    let url = context.mattermost_site_url;
    url += `/plugins/com.mattermost.apps/apps/${pluginName}${whPath}?secret=`;
    url += whSecret;
    return url;
}
