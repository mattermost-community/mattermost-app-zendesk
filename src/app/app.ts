import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppContext, AppCallValues, AppCallResponse} from 'mattermost-redux/types/apps';

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
        this.values = call.values;
        this.context = call.context;
    }
    createTicketFromPost = async (): Promise<AppCallResponse> => {
        // get zendesk client for user
        const zdClient = newZDClient(this.context);

        // create the ticket object from the form response
        const [zdTicket, fieldErrors] = newTicketFromForm(this.values);

        // respond with errors
        if (this.hasFieldErrors(fieldErrors)) {
            return newErrorCallResponseWithFieldErrors(fieldErrors);
        }

        // create the ticket in Zendesk
        const createReq = zdClient.tickets.create(zdTicket);
        const ticket = await tryPromiseWithMessage(createReq, 'Failed to create Zendesk ticket');

        // get the Zendesk user
        const getUserReq = zdClient.users.show(ticket.requester_id);
        const zdUser = await tryPromiseWithMessage(getUserReq, 'Failed to get Zendesk user');

        // create a reply to the original post noting the ticket was created
        const id = ticket.id;
        const subject = ticket.subject;
        const message = `${zdUser.name} created ticket [#${id}](${Env.ZD.Host}/agent/tickets/${id}) [${subject}]`;
        await this.createBotPost(message);

        return newOKCallResponse();
    }

    createZDSubscription = async (): Promise<AppCallResponse> => {
        // get zendesk client for user
        const zdClient = newZDClient(this.context);

        // create the trigger object from the form response
        let zdTrigger: any;
        let fieldErrors: FieldValidationErrors;
        try {
            [zdTrigger, fieldErrors] = newTriggerFromForm(this.values, this.context);
        } catch (e) {
            return newErrorCallResponseWithMessage(e.message);
        }

        if (this.hasFieldErrors(fieldErrors)) {
            return newErrorCallResponseWithFieldErrors(fieldErrors);
        }

        let request = zdClient.triggers.create(zdTrigger);
        let msg = 'Successfuly created subscription';
        if (zdTrigger.trigger.id) {
            request = zdClient.triggers.update(zdTrigger.trigger.id);
            msg = 'Successfuly updated subscription';
        }

        try {
            await tryPromiseWithMessage(request, msg);
        } catch (e) {
            return newErrorCallResponseWithMessage(e.message);
        }

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
