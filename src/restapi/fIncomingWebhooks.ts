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
    const promiseEvents: any[] = [];

    // build the new mapped event with promises for where needed
    for (const event of events) {
        if (event.field_name === 'ticket_form_id') {
            promiseEvents.push(getFormNames(zdClient, event));
            continue;
        }
        if (event.field_name === 'assignee_id') {
            promiseEvents.push(getAssigneeNames(zdClient, event));
            continue;
        }
        if (event.field_name === 'group_id') {
            promiseEvents.push(getGroupNames(zdClient, event));
            continue;

            // promiseEvents.push(getAssigneeNames(zdClient, event));
            // continue;
        }
        mappedArray.push(event);
    }

    // resolve all the Promises
    await Promise.all(promiseEvents).then((mappedEvents) => {
        for (const mappedEvent of mappedEvents) {
            mappedArray.push(mappedEvent);
        }
    });

    return mappedArray;
}

async function getFormNames(zdClient: ZDClient, event: any): Promise<any> {
    const prevReq = zdClient.ticketforms.show(event.previous_value);
    const prevForm = tryPromiseWithMessage(prevReq, 'Failed to fetch previous ticket form');

    const currReq = zdClient.ticketforms.show(event.value);
    const currForm = tryPromiseWithMessage(currReq, 'Failed to fetch current ticket form');

    await Promise.all([prevForm, currForm]).then((values) => {
        event.previous_value = values[0].name;
        event.value = values[1].name;
    });
    return event;
}

async function getGroupNames(zdClient: ZDClient, event: any): Promise<any> {
    const prevReq = zdClient.groups.show(event.previous_value);
    const prevGroup = tryPromiseWithMessage(prevReq, 'Failed to fetch previous group');

    const currReq = zdClient.groups.show(event.value);
    const currGroup = tryPromiseWithMessage(currReq, 'Failed to fetch current group');

    await Promise.all([prevGroup, currGroup]).then((values) => {
        event.previous_value = values[0].name;
        event.value = values[1].name;
    });
    return event;
}

async function getAssigneeNames(zdClient: ZDClient, event: any): Promise<any> {
    const prevReq = zdClient.users.show(event.previous_value);
    const prevUser = tryPromiseWithMessage(prevReq, 'Failed to get previous Zendesk user');

    const currReq = zdClient.users.show(event.value);
    const currUser = tryPromiseWithMessage(currReq, 'Failed to get current Zendesk user');

    await Promise.all([prevUser, currUser]).then((values) => {
        event.previous_value = values[0].name;
        event.value = values[1].name;
    });
    return event;
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
