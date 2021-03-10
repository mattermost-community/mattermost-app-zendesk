import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppContext, AppCallValues, AppCallResponse} from 'mattermost-redux/types/apps';

import {SubscriptionFields} from '../utils/constants';

import {
    newErrorCallResponseWithFieldErrors,
    newOKCallResponse,
    newOKCallResponseWithMarkdown,
    newErrorCallResponseWithMessage,
    FieldValidationErrors} from '../utils/call_responses';
import {Env, tryPromiseWithMessage} from '../utils';

import {newMMClient, newZDClient} from '../clients';

import {configStore} from '../store';

import {newTicketFromForm} from './ticketFromForm';
import {newTriggerFromForm} from './triggerFromForm';

export interface IApp {
    createTicketFromPost(): Promise<AppCallResponse>;
    createZDSubscription(): Promise<AppCallResponse>;
}

class App implements IApp {
    context: AppContext
    values: AppCallValues

    constructor(call: AppCall) {
        this.context = call.context;
        this.values = call.values;
    }
    createTicketFromPost = async (): Promise<AppCallResponse> => {
        // get zendesk client for user
        const zdClient = newZDClient(this.context);

        // create the ticket object from the form response
        const [zdTicketPayload, fieldErrors] = newTicketFromForm(this.values);

        // respond with errors
        if (this.hasFieldErrors(fieldErrors)) {
            return newErrorCallResponseWithFieldErrors(fieldErrors);
        }

        // create the ticket in Zendesk
        const createReq = zdClient.tickets.create(zdTicketPayload);
        const zdTicket = await tryPromiseWithMessage(createReq, 'Failed to create Zendesk ticket');

        // get the Zendesk user
        const getUserReq = zdClient.users.show(zdTicket.requester_id);
        const zdUser = await tryPromiseWithMessage(getUserReq, 'Failed to get Zendesk user');

        // create a reply to the original post noting the ticket was created
        const id = zdTicket.id;
        const subject = zdTicket.subject;
        const message = `${zdUser.name} created ticket [#${id}](${Env.ZD.Host}/agent/tickets/${id}) [${subject}]`;
        await this.createBotPost(message);

        return newOKCallResponse();
    }

    createZDSubscription = async (): Promise<AppCallResponse> => {
        // get zendesk client for user
        const zdClient = newZDClient(this.context);

        // create the trigger object from the form response
        let zdTriggerPayload: any;
        try {
            zdTriggerPayload = newTriggerFromForm(this.context, this.values);
        } catch (e) {
            return newErrorCallResponseWithMessage(e.message);
        }

        let request: any;
        let msg: string;
        let action: string;
        const link = '[subscription](' + Env.ZD.Host + '/agent/admin/triggers/' + zdTriggerPayload.trigger.id + ')';
        const subName = this.values[SubscriptionFields.SubTextName]
        switch (true) {
        case (this.values && this.values[SubscriptionFields.SubmitButtonsName] === SubscriptionFields.DeleteButtonLabel):
            request = zdClient.triggers.delete(zdTriggerPayload.trigger.id);
            msg = 'Successfuly deleted subscription';
            action = 'delete';
            break;
        case Boolean(zdTriggerPayload.trigger.id):
            request = zdClient.triggers.update(zdTriggerPayload.trigger.id);
            msg = `Successfuly updated ${link}`;
            action = 'update';
            break;
        default:
            request = zdClient.triggers.create(zdTriggerPayload);
            msg = `Successfuly created ${link}`;
            action = 'create';
        }

        msg += ` \`${subName}\``

        // Any zendesk error will produce an error in the modal
        try {
            await request;
        } catch (e) {
            return newErrorCallResponseWithMessage(`failed to ${action} subcription: ` + e.message);
        }

        // return the call response with successful markdown message
        return newOKCallResponseWithMarkdown(msg);
    }

    createBotPost = async (message: string): Promise<void> => {
        const adminClient = newMMClient().asAdmin();

        // add bot to team and channel
        const botUserID = configStore.getBotUserID();
        const addToTeamReq = adminClient.addToTeam(this.context.team_id, botUserID);
        await tryPromiseWithMessage(addToTeamReq, 'Failed to add bot to team');

        const addToChannelReq = adminClient.addToChannel(botUserID, this.context.channel_id);
        await tryPromiseWithMessage(addToChannelReq, 'Failed to add bot to team');

        const botClient = newMMClient().asBot();

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

export function newApp(call: AppCall): IApp {
    return new App(call);
}
