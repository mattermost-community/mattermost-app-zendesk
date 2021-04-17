// import {Post} from 'mattermost-redux/types/posts';

import {Request, Response} from 'express';
import {AppContext} from 'mattermost-redux/types/apps';

import {getManifest} from '../manifest';
import {Routes, tryPromiseWithMessage, contextFromRequest} from '../utils';
import {webhookConfigured} from '../utils/utils';
import {newZDClient, ZDClient} from '../clients';
import {newConfigStore} from '../store';
import {newOKCallResponseWithMarkdown} from '../utils/call_responses';

export async function fCreateTarget(req: Request, res: Response): Promise<void> {
    const context = contextFromRequest(req);
    const zdClient = await newZDClient(context);

    const text = await updateOrCreateTarget(zdClient, context);
    res.json(newOKCallResponseWithMarkdown(text));
}

// updateOrCreateTarget creates a target or updates an the exising target
async function updateOrCreateTarget(zdClient: ZDClient, context: AppContext): Promise<string> {
    const config = newConfigStore(context);
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

    // update or create the target
    if (webhookConfigured(cValues)) {
        const id = cValues.zd_target_id;

        // reuse the saved targetID. Failing to do so will invalidate all
        // previously created triggers attached to the previous targetID
        payload.target.id = id;
        const createReq = zdClient.targets.update(id, payload);
        await tryPromiseWithMessage(createReq, 'Failed to update Zendesk target');
        return 'Successfully updated Zendesk target';
    }

    const createReq = zdClient.targets.create(payload);
    const zdTarget = await tryPromiseWithMessage(createReq, 'Failed to create Zendesk target');
    cValues.zd_target_id = zdTarget.id;

    // save the targetID
    config.storeConfigInfo(cValues);
    return 'Successfully created Zendesk target';
}

function getTargetUrl(context: AppContext): string {
    const whSecret = context.app.webhook_secret;
    const pluginName = getManifest().app_id;
    const whPath = Routes.App.SubscribeIncomingWebhookPath;
    let url = context.mattermost_site_url;
    url += `/plugins/com.mattermost.apps/apps/${pluginName}${whPath}?secret=`;
    url += whSecret;
    return url;
}
