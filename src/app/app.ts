import {Post} from 'mattermost-redux/types/posts';
import {Channel} from 'mattermost-redux/types/channels';
import {AppCallRequest, AppCallResponse, AppCallValues, AppExpand, AppSelectOption, CtxExpandedBotActingUserOauth2UserTeamChannelPost} from 'types/apps';

import {
    FieldValidationErrors,
    newErrorCallResponseWithFieldErrors,
    newErrorCallResponseWithMessage,
    newOKCallResponse,
    newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {tryPromiseWithMessage} from '../utils';
import {newMMClient, newZDClient} from '../clients';
import {ZDClientOptions} from 'clients/zendesk';
import {MMClientOptions} from 'clients/mattermost';
import {SubscriptionFields} from '../utils/constants';
import {ZDTriggerPayload} from '../utils/ZDTypes';
import {newConfigStore} from '../store';

import {newTicketFromForm} from './ticketFromForm';
import {newTriggerFromForm} from './triggerFromForm';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

export interface App {
    createTicketFromPost(): Promise<AppCallResponse>;
    createZDSubscription(): Promise<AppCallResponse>;
    createBotDMPost(message: string): Promise<void>;
}

export class AppImpl implements App {
    call: AppCallRequest
    context: CtxExpandedBotActingUserOauth2UserTeamChannelPost
    values: AppCallValues
    zdOptions: ZDClientOptions
    mmOptions: MMClientOptions

    constructor(call: AppCallRequest) {
        this.call = call;
        this.context = call.context as CtxExpandedBotActingUserOauth2UserTeamChannelPost;
        this.values = call.values as AppCallValues;
        this.zdOptions = {
            oauth2UserAccessToken: this.context.oauth2.user?.token?.access_token,
            botAccessToken: this.context.bot_access_token,
            mattermostSiteUrl: this.context.mattermost_site_url,
        };
        this.mmOptions = {
            mattermostSiteURL: this.context.mattermost_site_url,
            actingUserAccessToken: this.context.acting_user_access_token,
            botAccessToken: this.context.bot_access_token,
        };
    }

    static expandCreateTicket = {
        post: AppExpandLevels.EXPAND_SUMMARY,
        team: AppExpandLevels.EXPAND_SUMMARY,
        channel: AppExpandLevels.EXPAND_SUMMARY,
        acting_user: AppExpandLevels.EXPAND_SUMMARY,
        acting_user_access_token: AppExpandLevels.EXPAND_ALL,
        oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
        oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
    };

    createTicketFromPost = async (): Promise<AppCallResponse> => {
        const zdClient = await newZDClient(this.zdOptions);

        // Create the ticket object from the form response
        const {payload, errors} = newTicketFromForm(this.call);

        // Respond with errors
        if (this.hasFieldErrors(errors)) {
            return newErrorCallResponseWithFieldErrors(errors);
        }

        // Create the ticket in Zendesk
        const createReq = zdClient.tickets.create(payload);
        const zdTicket = await tryPromiseWithMessage(createReq, 'Failed to create Zendesk ticket');

        // Get the Zendesk user
        const getUserReq = zdClient.users.show(zdTicket.requester_id);
        const zdUser = await tryPromiseWithMessage(getUserReq, 'Failed to get Zendesk user');

        // Create a reply to the original post noting the ticket was created
        const config = await newConfigStore(this.context.bot_access_token, this.context.mattermost_site_url).getValues();
        const host = config.zd_url;

        const id = zdTicket.id;
        const subject = zdTicket.subject;
        const message = `${zdUser.name} created ticket [#${id}](${host}/agent/tickets/${id})  **Subject:** \`${subject}\``;
        await this.createActingUserPost(message);

        return newOKCallResponse();
    }

    static expandSubscriptionForm: AppExpand = {
        oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
        team: AppExpandLevels.EXPAND_SUMMARY,
        channel: AppExpandLevels.EXPAND_SUMMARY,
        acting_user_access_token: AppExpandLevels.EXPAND_ALL,
    };

    createZDSubscription = async (): Promise<AppCallResponse> => {
        // Get zendesk client for user
        const zdClient = await newZDClient(this.zdOptions);

        const config = await newConfigStore(this.context.bot_access_token, this.context.mattermost_site_url).getValues();
        const host = config.zd_url;
        const targetID = config.zd_target_id;
        if (targetID === '') {
            return newErrorCallResponseWithMessage('failed to create subscription. TargetID is missing from the configuration data.');
        }

        // Create the trigger object from the form response
        let zdTriggerPayload: ZDTriggerPayload;
        try {
            zdTriggerPayload = newTriggerFromForm(this.call, targetID);
        } catch (e: any) {
            return newErrorCallResponseWithMessage(e.message);
        }

        // Create a reply to the original post noting the ticket was created
        let request: any;
        let action: string;
        let actionType: string;

        const uniqueSubnameError = {
            [SubscriptionFields.SubTextName]: 'Channel subscription names must be unique. Please choose another name.',
        };

        const subName = this.values[SubscriptionFields.SubTextName];
        switch (true) {
        case (this.values && this.values[SubscriptionFields.SubmitButtonsName] === SubscriptionFields.DeleteButtonLabel):
            request = zdClient.triggers.delete(zdTriggerPayload.trigger.id);
            action = 'Deleting';
            actionType = 'delete';
            break;
        case Boolean(zdTriggerPayload.trigger.id):
            if (!this.validateSubNameIsUnique(subName)) {
                return newErrorCallResponseWithFieldErrors(uniqueSubnameError);
            }
            request = zdClient.triggers.update(zdTriggerPayload.trigger.id, zdTriggerPayload);
            action = 'Updating';
            actionType = 'update';
            break;
        default:
            if (!this.validateSubNameIsUnique(subName)) {
                return newErrorCallResponseWithFieldErrors(uniqueSubnameError);
            }
            request = zdClient.triggers.create(zdTriggerPayload);
            action = 'Creating';
            actionType = 'create';
        }

        const actingUserClient = newMMClient(this.mmOptions).asActingUser();

        // Add bot to team and channel
        const botUserID = this.context.bot_user_id;

        const teamID = this.context.team.id;
        if (!teamID) {
            return newErrorCallResponseWithMessage('No team id provided in context');
        }

        const addToTeamReq = actingUserClient.addToTeam(teamID, botUserID);
        await tryPromiseWithMessage(addToTeamReq, 'Failed to add bot to team');

        const addToChannelReq = actingUserClient.addToChannel(botUserID, this.context.channel.id);
        await tryPromiseWithMessage(addToChannelReq, 'Failed to add bot to channel');

        // Any zendesk error will produce an error in the modal
        let msg: string;
        try {
            const trigger = await request;
            msg = `${action} subscription [${subName}](` + host + '/agent/admin/triggers/' + trigger.id + '). ';
        } catch (e: any) {
            return newErrorCallResponseWithMessage(`failed to ${actionType} subscription: ` + e.message);
        }

        msg += 'This could take a moment before your subscription data is saved in Zendesk';

        // Return the call response with successful markdown message
        return newOKCallResponseWithMarkdown(msg);
    }

    validateSubNameIsUnique = (proposedSubName: string): boolean => {
        // state.triggers contains the list of saved subscriptions in Zendesk
        const zdSubs = this.call.state.triggers;
        const values = this.call.values;

        // Label value of the selected dropdown subscription
        const selectedSubName = values?.[SubscriptionFields.SubSelectName].label;

        // If proposed subname does not exist in existing ZD subs, subname is unique
        const subFound = zdSubs.find((option: AppSelectOption) => option.label === proposedSubName);
        if (!subFound) {
            return true;
        }

        // matchingSubs is an array of existing ZD subs that match the proposed new subName
        const matchingSubs = zdSubs.filter((option: AppSelectOption) => option.label === proposedSubName);
        const numMatchingSubs = matchingSubs.length;

        // If changing the subName of an existing subscription, ensure new name does not exist
        if (selectedSubName !== proposedSubName) {
            return numMatchingSubs === 0;
        }

        return numMatchingSubs <= 1;
    }

    createActingUserPost = async (message: string): Promise<void> => {
        const actingUserClient = newMMClient(this.mmOptions).asActingUser();
        const actingUserID = this.context.acting_user.id;

        const rootID = this.context.post.root_id || this.context.post.id;
        const post = {
            message,
            user_id: actingUserID,
            channel_id: String(this.context.channel?.id),
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
            channel_id: String(this.context.channel?.id),
            root_id: String(rootID),
        } as Post;

        const botClient = newMMClient(this.mmOptions).asBot();
        const createPostReq = botClient.createPost(post);
        await tryPromiseWithMessage(createPostReq, 'Failed to create bot post');
    }

    createBotDMPost = async (message: string): Promise<void> => {
        const botUserID = this.context.bot_user_id;
        const actingUserID = this.context.acting_user.id;

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
