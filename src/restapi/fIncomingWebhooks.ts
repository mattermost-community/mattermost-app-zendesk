import {Post} from 'mattermost-redux/types/posts';
import {Request, Response} from 'express';

import {ExpandedBotAdminActingUser} from '../types/apps';
import {Routes, tryPromiseWithMessage} from '../utils';
import {TriggerFields} from '../utils/constants';
import {newZDClient, newMMClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';

import {newConfigStore} from '../store';

export async function fHandleSubcribeNotification(req: Request, res: Response): Promise<void> {
    const values = req.body.values.data;
    const context: ExpandedBotAdminActingUser = req.body.context;

    const ticketID = values[TriggerFields.TicketIDKey];
    const ticketTitle = values[TriggerFields.TicketTitleKey];
    const channelID = values[TriggerFields.ChannelIDKey];

    const config = await newConfigStore(context.bot_access_token, context.mattermost_site_url).getValues();
    const zdHost = config.zd_node_host;

    const token = config.zd_oauth_access_token;
    if (token === '') {
        throw new Error('Failed to get zd_oauth_access_token');
    }

    const zdOptions: ZDClientOptions = {
        oauth2UserAccessToken: token,
        botAccessToken: context.bot_access_token,
        mattermostSiteUrl: context.mattermost_site_url,
    };
    const zdClient = await newZDClient(zdOptions);
    const auditReq = zdClient.tickets.exportAudit(ticketID);
    const ticketAudits = await tryPromiseWithMessage(auditReq, `Failed to get ticket audits for ticket ${ticketID}`);
    const ticketAudit = ticketAudits.pop();
    const auditEvent = ticketAudit.events[0];

    const message: string = getNotificationMessage(zdHost, ticketID, ticketTitle, auditEvent);

    const mmOptions: MMClientOptions = {
        mattermostSiteURL: context.mattermost_site_url,
        actingUserAccessToken: context.acting_user_access_token,
        botAccessToken: context.bot_access_token,
        adminAccessToken: context.admin_access_token,
    };
    const adminClient = newMMClient(mmOptions).asBot();

    const post: Partial<Post> = {
        message,
        user_id: context.bot_user_id,
        channel_id: channelID,
    };

    const createPostReq = adminClient.createPost(post as Post);
    await tryPromiseWithMessage(createPostReq, 'Failed to create post');

    res.json({});
}

function getNotificationMessage(zdHost: string, ticketID: string, ticketTitle: string, auditEvent: any): string {
    const ZDTicketPath = Routes.ZD.TicketPathPrefix;
    const ticketLink = `[#${ticketID}](${zdHost}${ZDTicketPath}/${ticketID})`;
    const prefix = `Ticket ${ticketLink} [\`${ticketTitle}\`] -- `;
    switch (auditEvent.type) {
    case 'Comment':
        return `${prefix}\`${auditEvent.author_id}\` commented on ticket`;
    case 'Change':
        // auditEvent.author not defined for field name change;
        return `${prefix}\`${auditEvent.field_name}\` changed from \`${auditEvent.previous_value}\` to \`${auditEvent.value}\``;

    default:
        return `type not found. type = ${auditEvent.type})`;
    }
}
