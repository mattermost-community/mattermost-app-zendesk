import {Post} from 'mattermost-redux/types/posts';
import {ResponsePayload} from 'node-zendesk';
import {AppCall, AppContext} from 'mattermost-redux/types/apps';

import {ENV, errorWithMessage} from '../utils';

import {mattermost, zendesk} from '../clients';

import store from '../store/config';

import {getTicketForPost} from './model';

class App {
    createTicketFromPost = async (call: AppCall): Promise<void> => {
        const ticket = getTicketForPost(call.values);
        const userID = call.context.acting_user_id;
        const [token, found] = oauth.getToken(userID);

        const zdClient = zendesk.newClient(token, ENV.zendesk.apiURL);

        let result: Promise<ResponsePayload>;
        try {
            result = await zdClient.tickets.create(ticket);
        } catch (err) {
            throw new Error(errorWithMessage(err, 'Failed to create ticket'));
        }

        let user: Promise<ResponsePayload>;
        try {
            user = await zdClient.users.show(result.requester_id);
        } catch (err) {
            throw new Error(errorWithMessage(err, 'Failed to get user'));
        }

        const message = `${user.name} created ticket [#${result.id}](${ENV.zendesk.host}/agent/tickets/${result.id}) [${result.subject}]`;
        try {
            await this.createBotPost(call.context, message);
        } catch (err) {
            throw new Error(errorWithMessage(err, 'Failed to create post'));
        }
    }

    createBotPost = async (context: AppContext, message: string): Promise<void> => {
        const url = config.getSiteURL();
        const botToken = config.getBotAccessToken();
        const mmClient = mattermost.newClient(url, botToken);

        const post: Post = {
            message,
            channel_id: context.channel_id as string,
            root_id: context.post_id as string,
        };
        await mmClient.createPost(post);
    }
}

export default new App();
