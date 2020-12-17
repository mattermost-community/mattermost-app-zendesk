import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppContext} from 'mattermost-redux/types/apps';

import {ENV} from '../utils/constants';

import * as mattermost from '../mattermost/client';
import * as zendesk from '../zendesk/client';

import store from '../store/config';

import {getTicketForPost} from './model';

const apiURL = ENV.host_zendesk + '/api/v2' as string;

class App {
    async createTicketFromPost(call: AppCall): Promise<string> {
        console.log('createticketfrompost call = ', call);
        const ticket = getTicketForPost(call.values);

        const zdClient = zendesk.newClient(ENV.username, ENV.api_token, apiURL);

        const result = await zdClient.tickets.create(ticket);
        const user = await zdClient.users.show(result.requester_id);

        const message = `${user.name} created ticket [#${result.id}](${ENV.host_zendesk}/agent/tickets/${result.id}) [${result.subject}]`;
        await this.createBotPost(call.context, message);
    }

    async createBotPost(context: AppContext, message: string) {
        const url = store.getSiteURL() || 'http://localhost:8065';
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
