import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppContext} from 'mattermost-redux/types/apps';

import {ENV} from '../utils';

import {mattermost, zendesk} from '../clients';

import config from '../store/config';
import oauth from '../store/oauth';

import {getTicketForPost} from './model';

class App {
    createTicketFromPost = async (call: AppCall): Promise<string> => {
        const ticket = getTicketForPost(call.values);
        const userID = call.context.acting_user_id;
        const [token, found] = oauth.getToken(userID);

        // TODO if user is not found, they shouldn't even be able to see this
        // post menu option
        const zdClient = zendesk.newClient(token, ENV.zendesk.apiURL);

        const result = await zdClient.tickets.create(ticket);
        const user = await zdClient.users.show(result.requester_id);

        const message = `${user.name} created ticket [#${result.id}](${ENV.zendesk.host}/agent/tickets/${result.id}) [${result.subject}]`;
        await this.createBotPost(call.context, message);
    }

    createBotPost = async (context: AppContext, message: string) => {
        const url = config.getSiteURL();
        const botToken = config.getBotAccessToken();
        const mmClient = mattermost.newClient(botToken, url);

        const post: Post = {
            message,
            channel_id: context.channel_id,
            root_id: context.post_id,
        };
        await mmClient.createPost(post);
    }
}

export default new App();
