import {Post} from 'mattermost-redux/types/posts';
import {Tickets, Users} from 'node-zendesk';
import {AppCall, AppContext} from 'mattermost-redux/types/apps';

import {ENV, errorWithMessage} from '../utils';

import {mm, zd} from '../clients';

import {configStore, oauthStore} from '../store';

import {getTicketFromForm} from './model';

class App {
    createTicketFromPost = async (call: AppCall): Promise<void> => {
        // get active mattermost user ID
        const mmUserID = call.context.acting_user_id || '';
        const zdToken = oauthStore.getToken(mmUserID);
        if (!zdToken) {
            throw new Error('Failed to get user access_token');
        }

        // get zendesk client for user
        const zdClient = zd.newClient(zdToken);

        // create the ticket object from the form response
        const zdTicket = getTicketFromForm(call.values);

        // create the ticket in Zendesk
        let ticket: Tickets.ResponseModel;
        try {
            ticket = await zdClient.tickets.create(zdTicket);
        } catch (err) {
            throw new Error(errorWithMessage(err, 'Failed to create Zendesk ticket'));
        }

        // get the Zendesk user
        let zdUser: Users.ResponseModel;
        try {
            zdUser = await zdClient.users.show(ticket.requester_id);
        } catch (err) {
            throw new Error(errorWithMessage(err, 'Failed to get Zendesk user'));
        }

        // create a reply to the original post noting the ticket was created
        const id = ticket.id;
        const subject = ticket.subject;
        const message = `${zdUser.name} created ticket [#${id}](${ENV.zd.host}/agent/tickets/${id}) [${subject}]`;
        try {
            await this.createBotPost(call.context, message);
        } catch (err) {
            throw new Error(errorWithMessage(err, 'Failed to create post'));
        }
    }

    createBotPost = async (context: AppContext, message: string): Promise<void> => {
        const url = configStore.getSiteURL();
        const botToken = configStore.getBotAccessToken();
        const mmClient = mm.newClient(url, botToken);

        const post: Post = {
            message,
            channel_id: context.channel_id as string,
            root_id: context.post_id as string,
        };
        await mmClient.createPost(post);
    }
}

export default new App();
