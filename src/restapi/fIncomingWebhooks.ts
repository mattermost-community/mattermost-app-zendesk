import {Post} from 'mattermost-redux/types/posts';

import {AppCallResponse} from 'types/apps';

import {ExpandedBotActingUser} from '../types/apps';
import {Routes, tryPromiseWithMessage} from '../utils';
import {TriggerFields} from '../constants/zendesk';
import {newMMClient, newZDClient} from '../clients';
import {Groups, TicketForms, Users, ZDClient, ZDClientOptions} from 'clients/zendesk/types';
import {MMClientOptions} from 'clients/mattermost';

import {newConfigStore} from '../store/config';
import {CallResponseHandler, newOKCallResponse} from '../utils/call_responses';

export const fHandleSubcribeNotification: CallResponseHandler = async (req, res) => {
    const values = req.body.values.data;
    const context: ExpandedBotActingUser = req.body.context;

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

    if (message) {
        const mmOptions: MMClientOptions = {
            mattermostSiteURL: context.mattermost_site_url,
            actingUserAccessToken: context.acting_user_access_token,
            botAccessToken: context.bot_access_token,
        };
        const adminClient = newMMClient(mmOptions).asBot();

        const post: Partial<Post> = {
            message,
            user_id: context.bot_user_id,
            channel_id: channelID,
        };

        console.log(context);
        await tryPromiseWithMessage(createPostReq, 'Failed to create post');
    }

    const callResponse:AppCallResponse = newOKCallResponse();
    res.json(callResponse);
};

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

    const commentEvents = getEventTypes(auditEvents, 'Comment');
    if (commentEvents.length) {
        return `New comment on ${prefix}\n\n> ${commentEvents[0].plain_body}`;
    }

    return '';
}

// mapIDsToTextValues takes an array of events and maps ID values to human readable text
async function mapIDsToTextValues(zdClient: ZDClient, events: any[]): Promise<any> {
    const mappedArray: any[] = [];
    const promiseEvents: any[] = [];

    // Build the new mapped event with promises for where needed
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

    // Resolve all the Promises
    try {
        await Promise.all(promiseEvents).then((mappedEvents) => {
            for (const mappedEvent of mappedEvents) {
                mappedArray.push(mappedEvent);
            }
        });
    } catch (error: any) {
        throw new Error('Unable to map IDs to text values: ' + error.message);
    }
    return mappedArray;
}

async function getFormNames(zdClient: ZDClient, event: any): Promise<any> {
    const nameType = 'Form';
    return getNamesFromRequest(zdClient.ticketforms, event, nameType);
}

async function getGroupNames(zdClient: ZDClient, event: any): Promise<any> {
    const nameType = 'Group';
    return getNamesFromRequest(zdClient.groups, event, nameType);
}

async function getAssigneeNames(zdClient: ZDClient, event: any): Promise<any> {
    const nameType = 'Assignee';
    return getNamesFromRequest(zdClient.users, event, nameType);
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

// getNamesFromRequest return event
async function getNamesFromRequest(clientMethod: TicketForms | Groups | Users, event: any, nameType: string): Promise<any> {
    const requests: Promise<any>[] = [];
    requests.push(tryPromiseWithMessage(clientMethod.show(event.value), `Failed to fetch current ${nameType}`));

    if (event.previous_value) {
        const prevReq = clientMethod.show(event.previous_value);
        requests.push(tryPromiseWithMessage(prevReq, `Failed to fetch previous ${nameType}`));
    }

    try {
        await Promise.all(requests).then((values) => {
            event.value = values[0].name;
            if (values.length === 2) {
                event.previous_value = values[1].name;
            }
        });
    } catch (error: any) {
        throw new Error(`Unable to fetch ${nameType} names: ${error.message}`);
    }
    return event;
}
