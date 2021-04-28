import {Post} from 'mattermost-redux/types/posts';
import {Request, Response} from 'express';

import {ExpandedBotAdminActingUser} from '../types/apps';
import {Routes, tryPromiseWithMessage} from '../utils';
import {TriggerFields} from '../utils/constants';
import {newZDClient, newMMClient} from '../clients';
import {ZDClientOptions, ZDClient} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';

import {newConfigStore} from '../store';

export async function fHandleSubcribeNotification(req: Request, res: Response): Promise<void> {
    const values = req.body.values.data;
    const context: ExpandedBotAdminActingUser = req.body.context;

    const ticketID = values[TriggerFields.TicketIDKey];
    const ticketTitle = values[TriggerFields.TicketTitleKey];
    const channelID = values[TriggerFields.ChannelIDKey];

    const config = await newConfigStore(context.bot_access_token, context.mattermost_site_url).getValues();
    const zdUrl = config.zd_url;

    const token = config.zd_oauth_access_token;
    if (token === '') {
        throw new Error('Failed to get zd_oauth_access_token');
    }

    const zdOptions: ZDClientOptions = {
        oauth2UserAccessToken: token,
        botAccessToken: context.bot_access_token,
        mattermostSiteUrl: context.mattermost_site_url,
    };
    const zdClient: ZDClient = await newZDClient(zdOptions);
    const auditReq = zdClient.tickets.exportAudit(ticketID);
    const ticketAudits = await tryPromiseWithMessage(auditReq, `Failed to get ticket audits for ticket ${ticketID}`);
    const ticketAudit = ticketAudits.pop();
    const message = await getNotificationMessage(zdClient, zdUrl, ticketID, ticketTitle, ticketAudit);

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

async function getNotificationMessage(zdClient: ZDClient, zdUrl: string, ticketID: string, ticketTitle: string, ticketAudit: any): Promise<string> {
    const auditEvents = ticketAudit.events;
    const changeEvents = getEventTypes(auditEvents, 'Change');
    const idMappedEvents = await getIDMappedTypes(zdClient, changeEvents);

    const ZDTicketPath = Routes.ZD.TicketPathPrefix;
    const ticketLink = `[#${ticketID}](${zdUrl}${ZDTicketPath}/${ticketID})`;
    const prefix = `Ticket ${ticketLink}  **Subject:** \`${ticketTitle}\` `;

    return prefix + getChangedEventText(idMappedEvents);
}

async function getIDMappedTypes(zdClient: ZDClient, events: any[]): Promise<any> {
    const mappedArray: any[] = [];
    for (const event of events) {
        if (event.field_name === 'ticket_form_id') {
            event.previous_value = await getFormName(zdClient, event.previous_value);
            event.value = await getFormName(zdClient, event.value);
            mappedArray.push(event);
            continue;
        }
        if (event.field_name === 'assignee_id') {
            console.log('event', event);
            event.previous_value = await getAssigneeName(zdClient, event.previous_value);
            event.value = await getAssigneeName(zdClient, event.value);
            mappedArray.push(event);
            continue;
        }
        mappedArray.push(event);
    }
    return mappedArray;
}

async function getFormName(zdClient: ZDClient, formID: number): Promise<string> {
    const formReq = zdClient.ticketforms.show(formID);
    const form = await tryPromiseWithMessage(formReq, 'Failed to fetch ticket forms');
    return form.display_name;
}

async function getAssigneeName(zdClient: ZDClient, assigneeID: number): Promise<string> {
    const userReq = zdClient.users.show(assigneeID);
    const zdUser = await tryPromiseWithMessage(userReq, 'Failed to get Zendesk user');
    return zdUser.name;
}

function getEventTypes(auditEvents: any, eventType: string): any {
    return auditEvents.filter((event) => {
        return event.type === eventType;
    });
}

function getChangedEventText(events: any[]): string {
    if (events.length === 1) {
        const event = events[0];
        return `\`${event.field_name}\` changed from \`${event.previous_value}\` to \`${event.value}\``;
    }
    const newArray = events.map((event) => {
        return `* \`${event.field_name}\` changed from \`${event.previous_value}\` to \`${event.value}\``;
    });
    return 'The following field values changed \n' + newArray.join('\n');
}
