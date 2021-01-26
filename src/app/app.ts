import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppContext} from 'mattermost-redux/types/apps';

import {ENV, tryCallWithMessage, errorWithMessage} from '../utils';

import {newMMClient, newZDClient} from '../clients';

import {configStore, oauthStore} from '../store';

import {newTicketFromForm, fieldValidationErrors} from './model';

class App {
    createTicketFromPost = async (call: AppCall): Promise<fieldValidationErrors> => {
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
        const ticket = await tryCallWithMessage(zdClient.tickets.create(zdTicket), 'Failed to create Zendesk ticket');

        // get the Zendesk user
        const zdUser = await tryCallWithMessage(zdClient.users.show(ticket.requester_id), 'Failed to get Zendesk user');

        // create a reply to the original post noting the ticket was created
        const id = ticket.id;
        const subject = ticket.subject;
        const message = `${zdUser.name} created ticket [#${id}](${ENV.zd.host}/agent/tickets/${id}) [${subject}]`;
        await this.createBotPost(call.context, message);

        // no respond with no errors
        return {};
    }

    createBotPost = async (context: AppContext, message: string): Promise<void> => {
        const botToken = configStore.getBotAccessToken();
        const mmClient = newMMClient(botToken);

        const post: Post = {
            message,
            channel_id: context.channel_id as string,
            root_id: context.post_id as string,
        };

        // await tryCallWithMessage(mmClient.createPost(post), 'Failed to create Zendesk ticket');

        try {
            await mmClient.createPost(post);
        } catch (err) {
            throw new Error(errorWithMessage(err, 'Failed to create post'));
        }
    }
}

export default new App();
