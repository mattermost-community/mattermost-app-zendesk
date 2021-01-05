import {Post} from 'mattermost-redux/types/posts';
import {ResponsePayload} from 'node-zendesk';
import {AppCall, AppContext} from 'mattermost-redux/types/apps';

import {ENV, errorWithMessage} from '../utils';

import {mattermost, zendesk} from '../clients';

import store from '../store/config';

import {getTicketForPost} from './model';

class App {
    createTicketFromPost = async (call: AppCall): Promise<string> => {
        const ticket = getTicketForPost(call.values);
        const zdClient = zendesk.newClient(ENV.zendesk.username, ENV.zendesk.apiToken, ENV.zendesk.apiURL);
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

    createBotPost = async (context: AppContext, message: string) => {
        const url = store.getSiteURL();
        const botToken = store.getBotAccessToken();
        const mmClient = mattermost.newClient(url, botToken);

        const post: Post = {
            message,
            channel_id: context.channel_id,
            root_id: context.post_id,
        };
        await mmClient.createPost(post);
    }
}

export default new App();
