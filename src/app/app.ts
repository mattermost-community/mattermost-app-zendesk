import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppContext} from 'mattermost-redux/types/apps';

import * as mattermost from '../mattermost/client';
import * as zendesk from '../zendesk/client';

import store from '../store/config';

import {getTicketForPost} from './model';

const username = process.env.ZENDESK_USERNAME as string;
const zdToken = process.env.ZENDESK_API_TOKEN as string;
const apiURL = process.env.ZENDESK_URL + '/api/v2' as string;

class App {
    async createTicketFromPost(call: AppCall): Promise<string> {
        const ticket = getTicketForPost(call.values);

        const zdClient = zendesk.newClient(username, zdToken, apiURL);

        const result = await zdClient.tickets.create(ticket);
        const user = await zdClient.users.show(result.requester_id);

        const host = process.env.ZENDESK_URL;
        const message = `${user.name} created ticket [#${result.id}](${host}/agent/tickets/${result.id}) [${result.subject}]`;
        await this.createBotPost(call.context, message);
    }

    async createBotPost(context: AppContext, message: string) {
        const url = process.env.MM_SITEURL || 'http://localhost:8065';
        const botToken = store.getBotAccessToken();
        const client = mattermost.newClient(botToken, url);

        const post: Post = {
            message,
            channel_id: context.channel_id,
            root_id: context.post_id,
        };
        await client.createPost(post);
    }
}

export default new App();
