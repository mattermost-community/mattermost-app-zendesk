import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppContext, AppCallValues, AppCallResponse} from 'mattermost-redux/types/apps';

import {SubscriptionFields} from '../utils/constants';

import {newConfigStore} from '../store';

import {
    newErrorCallResponseWithFieldErrors,
    newOKCallResponse,
    newOKCallResponseWithMarkdown,
    newErrorCallResponseWithMessage,
    FieldValidationErrors} from '../utils/call_responses';
import {tryPromiseWithMessage} from '../utils';

import {newMMClient, newZDClient} from '../clients';

import {newTicketFromForm} from './ticketFromForm';
import {newTriggerFromForm} from './triggerFromForm';

export interface App {
    createTicketFromPost(): Promise<AppCallResponse>;
    createZDSubscription(): Promise<AppCallResponse>;
}

class AppImpl implements App {
    call: AppCall
    context: AppContext
    values: AppCallValues

    constructor(call: AppCall) {
        this.call = call;
        this.context = call.context;
        this.values = call.values;
    }
    createTicketFromPost = async (): Promise<AppCallResponse> => {
        // get zendesk client for user
        const zdClient = await newZDClient(this.context);

        // create the ticket object from the form response
        const {payload, errors} = newTicketFromForm(this.call);

        // respond with errors
        if (this.hasFieldErrors(errors)) {
            return newErrorCallResponseWithFieldErrors(errors);
        }

        // create the ticket in Zendesk
        const createReq = zdClient.tickets.create(payload);
        const zdTicket = await tryPromiseWithMessage(createReq, 'Failed to create Zendesk ticket');

        // get the Zendesk user
        const getUserReq = zdClient.users.show(zdTicket.requester_id);
        const zdUser = await tryPromiseWithMessage(getUserReq, 'Failed to get Zendesk user');

        // create a reply to the original post noting the ticket was created
        const config = await newConfigStore(this.context).getValues();
        const host = config.zd_url;

        const id = zdTicket.id;
        const subject = zdTicket.subject;
        const message = `${zdUser.name} created ticket [#${id}](${host}/agent/tickets/${id}) [${subject}]`;
        await this.createActingUserPost(message);

        return newOKCallResponse();
    }

    createZDSubscription = async (): Promise<AppCallResponse> => {
        // get zendesk client for user
        const zdClient = await newZDClient(this.context);

        const config = await newConfigStore(this.context).getValues();
        const host = config.zd_url;
        const targetID = config.zd_target_id;
        if (targetID === '') {
            return newErrorCallResponseWithMessage('failed to create subscription. TargetID is missing from the configuration data.');
        }

        // create the trigger object from the form response
        let zdTriggerPayload: any;
        try {
            zdTriggerPayload = newTriggerFromForm(this.call, targetID);
        } catch (e) {
            return newErrorCallResponseWithMessage(e.message);
        }

        // create a reply to the original post noting the ticket was created
        let request: any;
        let msg: string;
        let action: string;
        const link = '[subscription](' + host + '/agent/admin/triggers/' + zdTriggerPayload.trigger.id + ')';
        const subName = this.values[SubscriptionFields.SubTextName];
        switch (true) {
        case (this.values && this.values[SubscriptionFields.SubmitButtonsName] === SubscriptionFields.DeleteButtonLabel):
            request = zdClient.triggers.delete(zdTriggerPayload.trigger.id);
            msg = 'Successfully deleted subscription';
            action = 'delete';
            break;
        case Boolean(zdTriggerPayload.trigger.id):
            request = zdClient.triggers.update(zdTriggerPayload.trigger.id);
            msg = `Successfully updated ${link}`;
            action = 'update';
            break;
        default:
            request = zdClient.triggers.create(zdTriggerPayload);
            msg = `Successfully created ${link}`;
            action = 'create';
        }

        msg += ` \`${subName}\``;

        // Any zendesk error will produce an error in the modal
        try {
            await request;
        } catch (e) {
            return newErrorCallResponseWithMessage(`failed to ${action} subscription: ` + e.message);
        }

        // return the call response with successful markdown message
        return newOKCallResponseWithMarkdown(msg);
    }

    createActingUserPost = async (message: string): Promise<void> => {
        const actingUserClient = newMMClient(this.context).asActingUser();
        const user_id = this.context.acting_user_id;

        const post: Post = {
            message,
            user_id,
            channel_id: String(this.context.channel_id),
            root_id: String(this.context.post_id),
        };

        const createPostReq = actingUserClient.createPost(post);
        await tryPromiseWithMessage(createPostReq, 'Failed to create post');
    }

    createBotPost = async (message: string): Promise<void> => {
        const adminClient = newMMClient(this.context).asActingUser();

        // add bot to team and channel
        const botUserID = this.context.bot_user_id;
        const addToTeamReq = adminClient.addToTeam(this.context.team_id, botUserID);
        await tryPromiseWithMessage(addToTeamReq, 'Failed to add bot to team');

        const addToChannelReq = adminClient.addToChannel(botUserID, this.context.channel_id);
        await tryPromiseWithMessage(addToChannelReq, 'Failed to add bot to channel');

        const botClient = newMMClient(this.context).asBot();

        const post: Post = {
            message,
            user_id: botUserID,
            channel_id: String(this.context.channel_id),
            root_id: String(this.context.post_id),
        };

        const createPostReq = botClient.createPost(post);
        await tryPromiseWithMessage(createPostReq, 'Failed to create post');
    }

    hasFieldErrors(errors: FieldValidationErrors): boolean {
        return Object.keys(errors).length !== 0;
    }
}

export function newApp(call: AppCall): App {
    return new AppImpl(call);
}
