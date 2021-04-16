import {Post} from 'mattermost-redux/types/posts';

import {Request, Response} from 'express';

import {Routes, tryPromiseWithMessage, contextFromRequest} from '../utils';
import {TriggerFields} from '../utils/constants';

import {newZDClient, newMMClient} from '../clients';

import {newConfigStore} from '../store';

export async function fHandleSubcribeNotification(req: Request, res: Response): Promise<void> {
    const values = req.body.values.data;
    const context = contextFromRequest(req);

    const ticketID = values[TriggerFields.TicketIDKey];
    const channelID = values[TriggerFields.ChannelIDKey];

    const config = await newConfigStore(context).getValues();
    const zdHost = config.zd_node_host;

    const connectedUser = config.zd_oauth_access_token;
    if (connectedUser === '') {
        throw new Error('Failed to get zd_oauth_access_token');
    }

    // add the configured access_token to the context so the ZD client can make
    // API requests
    context.oauth2 = {user: {access_token: connectedUser}};

    const zdClient = await newZDClient(context);
    const auditReq = zdClient.tickets.exportAudit(ticketID);
    const ticketAudits = await tryPromiseWithMessage(auditReq, `Failed to get ticket audits for ticket ${ticketID}`);
    const ticketAudit = ticketAudits.pop();
    const auditEvent = ticketAudit.events[0];

    const message: string = getNotificationMessage(zdHost, ticketID, auditEvent);

    const adminClient = newMMClient(context).asBot();

    const post: Post = {
        message,
        user_id: context.bot_user_id,
        channel_id: channelID,
    };

    const createPostReq = adminClient.createPost(post);
    await tryPromiseWithMessage(createPostReq, 'Failed to create post');

    res.json({});
}

function getNotificationMessage(zdHost: string, ticketID: string, auditEvent: any): string {
    const ZDTicketPath = Routes.ZD.TicketPathPrefix;
    const ticketLink = `[${ticketID}](${zdHost}${ZDTicketPath}/${ticketID})`;

    switch (auditEvent.type) {
    case 'Comment':
        return `Ticket (${ticketLink}) -- \`${auditEvent.author_id}\` commented on ticket \`${auditEvent.body}\``;
    case 'Change':
        // auditEvent.author not defined for field name change;
        return `Ticket (${ticketLink}) -- \`${auditEvent.field_name}\` changed from \`${auditEvent.previous_value}\` to \`${auditEvent.value}\``;

    default:
        return `type not found. type = ${auditEvent.type})`;
    }
}
