import {Post} from 'mattermost-redux/types/posts';
import {Channel} from 'mattermost-redux/types/channels';
import {AppCallValues, AppCallResponse, AppCallRequest} from 'mattermost-redux/types/apps';

import {
    newErrorCallResponseWithFieldErrors,
    newOKCallResponse,
    newOKCallResponseWithMarkdown,
    newErrorCallResponseWithMessage,
    FieldValidationErrors} from '../utils/call_responses';
import {tryPromiseWithMessage, isUserSystemAdmin} from '../utils';
import {newMMClient, newZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';
import {CtxExpandedBotAdminActingUserOauth2UserChannelPost} from '../types/apps';
import {SubscriptionFields} from '../utils/constants';
import {ZDTriggerPayload} from '../utils/ZDTypes';
import {newConfigStore} from '../store';

import {newTicketFromForm} from './ticketFromForm';
import {newTriggerFromForm} from './triggerFromForm';

export interface App {
    createTicketFromPost(): Promise<AppCallResponse>;
    createZDSubscription(): Promise<AppCallResponse>;
    createBotDMPost(message: string): Promise<void>;
}

class AppImpl implements App {
    call: AppCallRequest
    context: CtxExpandedBotAdminActingUserOauth2UserChannelPost
    values: AppCallValues
    zdOptions: ZDClientOptions
    mmOptions: MMClientOptions

    constructor(call: AppCallRequest) {
        this.call = call;
        this.context = call.context as CtxExpandedBotAdminActingUserOauth2UserChannelPost;
        this.values = call.values as AppCallValues;
        this.zdOptions = {
            oauth2UserAccessToken: this.context.oauth2.user.token.access_token,
            botAccessToken: this.context.bot_access_token,
            mattermostSiteUrl: this.context.mattermost_site_url,
        };
        this.mmOptions = {
            mattermostSiteURL: this.context.mattermost_site_url,
            actingUserAccessToken: this.context.acting_user_access_token,
            botAccessToken: this.context.bot_access_token,
            adminAccessToken: this.context.admin_access_token,
        };
    }
    createTicketFromPost = async (): Promise<AppCallResponse> => {
        const zdClient = await newZDClient(this.zdOptions);

        // create the ticket object from the form response
        const {payload, errors} = newTicketFromForm(this.call);

        // respond with errors
        if (this.hasFieldErrors(errors)) {
            return newErrorCallResponseWithFieldErrors(errors);
        }

        // create the ticket in Zendesk
        const createReq = zdClient.tickets.create(payload);
        const zdTicket = await tryPromiseWithMessage(createReq, 'Failed to create Zendesk ticket');

        // get the Zendesk user
        const getUserReq = zdClient.users.show(zdTicket.requester_id);
        const zdUser = await tryPromiseWithMessage(getUserReq, 'Failed to get Zendesk user');

        // create a reply to the original post noting the ticket was created
        const config = await newConfigStore(this.context.bot_access_token, this.context.mattermost_site_url).getValues();
        const host = config.zd_url;

        const id = zdTicket.id;
        const subject = zdTicket.subject;
        const message = `${zdUser.name} created ticket [#${id}](${host}/agent/tickets/${id})  **Subject:** \`${subject}\``;
        await this.createActingUserPost(message);

        return newOKCallResponse();
    }

    createZDSubscription = async (): Promise<AppCallResponse> => {
        // get zendesk client for user
        const zdClient = await newZDClient(this.zdOptions);

        const config = await newConfigStore(this.context.bot_access_token, this.context.mattermost_site_url).getValues();
        const host = config.zd_url;
        const targetID = config.zd_target_id;
        if (targetID === '') {
            return newErrorCallResponseWithMessage('failed to create subscription. TargetID is missing from the configuration data.');
        }

        // create the trigger object from the form response
        let zdTriggerPayload: ZDTriggerPayload;
        try {
            zdTriggerPayload = newTriggerFromForm(this.call, targetID);
        } catch (e) {
            return newErrorCallResponseWithMessage(e.message);
        }

        // create a reply to the original post noting the ticket was created
        let request: any;
        let action: string;
        let actionType: string;
        const subName = this.values[SubscriptionFields.SubTextName];
        switch (true) {
        case (this.values && this.values[SubscriptionFields.SubmitButtonsName] === SubscriptionFields.DeleteButtonLabel):
            request = zdClient.triggers.delete(zdTriggerPayload.trigger.id);
            action = 'Deleting';
            actionType = 'delete';
            break;
        case Boolean(zdTriggerPayload.trigger.id):
            request = zdClient.triggers.update(zdTriggerPayload.trigger.id, zdTriggerPayload);
            action = 'Updating';
            actionType = 'update';
            break;
        default:
            request = zdClient.triggers.create(zdTriggerPayload);
            action = 'Creating';
            actionType = 'create';
        }

        const actingUserClient = newMMClient(this.mmOptions).asActingUser();

        // add bot to team and channel
        const botUserID = this.context.bot_user_id;
        const addToTeamReq = actingUserClient.addToTeam(this.context.team_id, botUserID);
        await tryPromiseWithMessage(addToTeamReq, 'Failed to add bot to team');

        const addToChannelReq = actingUserClient.addToChannel(botUserID, this.context.channel_id);
        await tryPromiseWithMessage(addToChannelReq, 'Failed to add bot to channel');

        // Any zendesk error will produce an error in the modal
        let msg: string;
        try {
            const trigger = await request;
            msg = `${action} subscription [${subName}](` + host + '/agent/admin/triggers/' + trigger.id + '). ';
        } catch (e) {
            return newErrorCallResponseWithMessage(`failed to ${actionType} subscription: ` + e.message);
        }

        msg += 'This could take a moment before your subscription data is saved in Zendesk';

        // return the call response with successful markdown message
        return newOKCallResponseWithMarkdown(msg);
    }

    createActingUserPost = async (message: string): Promise<void> => {
        const actingUserClient = newMMClient(this.mmOptions).asActingUser();
        const userID = this.context.acting_user_id;

        const rootID = this.context.post.root_id || this.context.post.id;
        const post = {
            message,
            user_id: userID,
            channel_id: String(this.context.channel_id),
            root_id: String(rootID),
        } as Post;

        const createPostReq = actingUserClient.createPost(post);
        await tryPromiseWithMessage(createPostReq, 'Failed to create acting user post');
    }

    createBotPost = async (message: string): Promise<void> => {
        const botUserID = this.context.bot_user_id;

        const rootID = this.context.post.root_id || this.context.post.id;
        const post = {
            message,
            user_id: botUserID,
            channel_id: String(this.context.channel_id),
            root_id: String(rootID),
        } as Post;

        const botClient = newMMClient(this.mmOptions).asBot();
        const createPostReq = botClient.createPost(post);
        await tryPromiseWithMessage(createPostReq, 'Failed to create bot post');
    }

    createBotDMPost = async (message: string): Promise<void> => {
        const botUserID = this.context.bot_user_id;
        const actingUserID = this.context.acting_user_id;

        const botClient = newMMClient(this.mmOptions).asBot();
        const channel: Channel = await botClient.createDirectChannel([botUserID, actingUserID]);

        const post = {
            message,
            user_id: botUserID,
            channel_id: channel.id,
            root_id: '',
        } as Post;

        const createPostReq = botClient.createPost(post);
        await tryPromiseWithMessage(createPostReq, 'Failed to create bot DM post');
    }

    hasFieldErrors(errors: FieldValidationErrors): boolean {
        return Object.keys(errors).length !== 0;
    }
}

export function newApp(call: AppCallRequest): App {
    return new AppImpl(call);
}
