import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppContext} from 'mattermost-redux/types/apps';

import {ENV} from '../utils/constants';

import * as mattermost from '../mattermost/client';
import * as zendesk from '../zendesk/client';

import store from '../store/config';

import {getTicketForPost} from './model';

class App {
    async createTicketFromPost(call: AppCall): Promise<string> {
        const ticket = getTicketForPost(call.values);

        const zdClient = zendesk.newClient(ENV.zendesk.username, ENV.zendesk.apiToken, ENV.zendesk.apiURL);

        const result = await zdClient.tickets.create(ticket);
        const user = await zdClient.users.show(result.requester_id);

        const message = `${user.name} created ticket [#${result.id}](${ENV.zendesk.host}/agent/tickets/${result.id}) [${result.subject}]`;
        await this.createBotPost(call.context, message);
    }

    async createBotPost(context: AppContext, message: string) {
        const url = store.getSiteURL();
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
