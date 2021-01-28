import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppContext} from 'mattermost-redux/types/apps';

import {Env, tryPromiseWithMessage, errorWithMessage} from '../utils';

import {newMMClient, newZDClient} from '../clients';

import {configStore, oauthStore} from '../store';

import {newTicketFromForm, FieldValidationErrors} from './model';

class App {
    createTicketFromPost = async (call: AppCall): Promise<FieldValidationErrors> => {
        // get active mattermost user ID
        const mmUserID = call.context.acting_user_id || '';
        const zdToken = oauthStore.getToken(mmUserID);
        if (!zdToken) {
            throw new Error('Failed to get user access_token');
        }

        // get zendesk client for user
        const zdClient = newZDClient(zdToken);

        // create the ticket object from the form response
        const [zdTicket, errors] = newTicketFromForm(call.values);

        // respond with errors
        if (Object.keys(errors).length !== 0) {
            return errors;
        }

        // create the ticket in Zendesk
        const ticket = await tryPromiseWithMessage(zdClient.tickets.create(zdTicket), 'Failed to create Zendesk ticket');

        // get the Zendesk user
        const zdUser = await tryPromiseWithMessage(zdClient.users.show(ticket.requester_id), 'Failed to get Zendesk user');

        // create a reply to the original post noting the ticket was created
        const id = ticket.id;
        const subject = ticket.subject;
        const message = `${zdUser.name} created ticket [#${id}](${Env.ZD.Host}/agent/tickets/${id}) [${subject}]`;
        await this.createBotPost(call.context, message);

        // respond with no errors
        return {};
    }

    createBotPost = async (context: AppContext, message: string): Promise<void> => {
        const adminToken = configStore.getAdminAccessToken();
        const adminClient = newMMClient(adminToken);

        // add bot to team and channel
        const botUserID = configStore.getBotUserID();
        await tryPromiseWithMessage(adminClient.addToTeam(context.team_id, botUserID), 'Failed to add bot to team');
        await tryPromiseWithMessage(adminClient.addToChannel(botUserID, context.channel_id), 'Failed to add bot to team');

        const botToken = configStore.getBotAccessToken();
        const botClient = newMMClient(botToken);

        const post: Post = {
            message,
            user_id: botUserID,
            channel_id: context.channel_id as string,
            root_id: context.post_id as string,
        };

        await tryPromiseWithMessage(botClient.createPost(post), 'Failed to create post');
    }
}

export default new App();
