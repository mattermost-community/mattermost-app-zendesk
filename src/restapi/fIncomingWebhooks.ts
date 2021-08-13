import {Post} from 'mattermost-redux/types/posts';
import {Request, Response} from 'express';

import {ExpandedBotAdminActingUser} from '../types/apps';
import {Routes, tryPromiseWithMessage} from '../utils';
import {TriggerFields} from '../utils/constants';
import {newZDClient, newMMClient} from '../clients';
import {ZDClientOptions, ZDClient} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';

import {newConfigStore, AppConfigStore} from '../store/config';

export async function fHandleSubcribeNotification(req: Request, res: Response): Promise<void> {
    const values = req.body.values.data;
    const context: ExpandedBotAdminActingUser = req.body.context;

    const ticketID = values[TriggerFields.TicketIDKey];
    const ticketTitle = values[TriggerFields.TicketTitleKey];
    const channelID = values[TriggerFields.ChannelIDKey];

    const configStore = newConfigStore(context.bot_access_token, context.mattermost_site_url);
    const config = await tryPromiseWithMessage(configStore.getValues(), 'fHandleSubcribeNotification - Failed to get config values');
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

    const zdClient: ZDClient = await tryPromiseWithMessage(newZDClient(zdOptions), 'fHandleSubcribeNotification - Failed to get newZDClient');
    const auditReq = zdClient.tickets.exportAudit(ticketID);
    const ticketAudits = await tryPromiseWithMessage(auditReq, `Failed to get ticket audits for ticket ${ticketID}`);
    const ticketAudit = ticketAudits.pop();
    const message = await tryPromiseWithMessage(getNotificationMessage(zdClient, zdUrl, ticketID, ticketTitle, ticketAudit), 'fHandleSubcribeNotification - failed to get notification message');

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

// getNotificationMessage returns text for a post message
async function getNotificationMessage(zdClient: ZDClient, zdUrl: string, ticketID: string, ticketTitle: string, ticketAudit: any): Promise<string> {
    const ZDTicketPath = Routes.ZD.TicketPathPrefix;
    const ticketLink = `${zdUrl}${ZDTicketPath}/${ticketID}`;
    const prefix = `Ticket [#${ticketID}](${ticketLink})  **Subject: [${ticketTitle}](${ticketLink})**  `;

    const auditEvents = ticketAudit.events;
    const changeEvents = getEventTypes(auditEvents, 'Change');
    if (changeEvents.length) {
        const events = await mapIDsToTextValues(zdClient, changeEvents);
        return prefix + getChangedEventText(events);
    }

    const createEvents = getEventTypes(auditEvents, 'Create');
    if (createEvents.length) {
        const events = await mapIDsToTextValues(zdClient, createEvents);
        return '**[NEW TICKET]** ' + prefix + getCreatedEventText(events);
    }
    throw new Error('Event type does not contain Change or Create event types');
}

// mapIDsToTextValues takes an array of events and maps ID values to human
// readable text
async function mapIDsToTextValues(zdClient: ZDClient, events: any[]): Promise<any> {
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
        if (event.field_name === 'requester_id') {
            promiseEvents.push(getAssigneeNames(zdClient, event));
            continue;
        }
        if (event.field_name === 'group_id') {
            promiseEvents.push(getGroupNames(zdClient, event));
            continue;
        }
        mappedArray.push(event);
    }

    // resolve all the Promises
    try {
        await Promise.all(promiseEvents).then((mappedEvents) => {
            for (const mappedEvent of mappedEvents) {
                mappedArray.push(mappedEvent);
            }
        });
    } catch (error) {
        throw new Error('Unable to map IDs to text values: ' + error.message);
    }
    return mappedArray;
}

async function getFormNames(zdClient: ZDClient, event: any): Promise<any> {
    const requests: any[] = [];
    const currReq = zdClient.ticketforms.show(event.value);
    requests.push(tryPromiseWithMessage(currReq, 'Failed to fetch current ticket form'));

    if (event.previous_value) {
        const prevReq = zdClient.ticketforms.show(event.previous_value);
        requests.push(tryPromiseWithMessage(prevReq, 'Failed to fetch previous ticket form'));
    }

    try {
        await Promise.all(requests).then((values) => {
            event.value = values[0].name;
            if (values.length === 2) {
                event.previous_value = values[1].name;
            }
        });
    } catch (error) {
        throw new Error('Unable to get Form Names: ' + error.message);
    }
    return event;
}

async function getGroupNames(zdClient: ZDClient, event: any): Promise<any> {
    const requests: any[] = [];
    const currReq = zdClient.groups.show(event.value);
    requests.push(tryPromiseWithMessage(currReq, 'Failed to fetch current group'));

    if (event.previous_value) {
        const prevReq = zdClient.groups.show(event.previous_value);
        requests.push(tryPromiseWithMessage(prevReq, 'Failed to fetch previous group'));
    }

    try {
        await Promise.all(requests).then((values) => {
            event.value = values[0].name;
            if (values.length === 2) {
                event.previous_value = values[1].name;
            }
        });
    } catch (error) {
        throw new Error('Unable to get Group Names: ' + error.message);
    }
    return event;
}

async function getAssigneeNames(zdClient: ZDClient, event: any): Promise<any> {
    const requests: any[] = [];
    const currReq = zdClient.users.show(event.value);
    requests.push(tryPromiseWithMessage(currReq, 'Failed to get current Zendesk user'));

    if (event.previous_value) {
        const prevReq = zdClient.users.show(event.previous_value);
        requests.push(tryPromiseWithMessage(prevReq, 'Failed to get previous Zendesk user'));
    }

    try {
        await Promise.all(requests).then((values) => {
            event.value = values[0].name;
            if (values.length === 2) {
                event.previous_value = values[1].name;
            }
        });
    } catch (error) {
        throw new Error('Unable to get Assignee Names: ' + error.message);
    }
    return event;
}

// getEventTypes returns events for a specified event type
function getEventTypes(auditEvents: any, eventType: string): any {
    return auditEvents.filter((event) => {
        return event.type === eventType;
    });
}

// getChangedEventText returns text for a changed event types
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

// getCreatedEventText returns text for a create event types
function getCreatedEventText(events: any[]): string {
    const newArray = events.map((event) => {
        return `* ${event.field_name}: \`${event.value}\``;
    });
    return 'A new ticket was created with the following properties: \n' + newArray.join('\n');
}
