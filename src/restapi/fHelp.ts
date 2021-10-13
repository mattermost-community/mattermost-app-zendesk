import {AppCallRequest, AppCallResponse} from 'mattermost-redux/types/apps';

import {ExpandedBotAdminActingUser} from '../types/apps';
import {newOKCallResponseWithMarkdown, CallResponseHandler} from '../utils/call_responses';
import {getManifest} from '../manifest';
import {CommandTrigger} from '../utils/constants';
import {isUserSystemAdmin} from '../utils';

export const fHelp: CallResponseHandler = async (req, res) => {
    const helpText = [
        getHeader(),
        getCommands(req.body),
        getPostText(),
    ].join('');
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(helpText);
    res.json(callResponse);
};

function getHeader(): string {
    const homepageURL = getManifest().homepage_url;
    return h4(`Zendesk [(GitHub Link)](${homepageURL})`);
}

function getCommands(call: AppCallRequest): string {
    const context = call.context as ExpandedBotAdminActingUser;
    let text = getUserCommands();
    if (isUserSystemAdmin(context.acting_user)) {
        text += getAdminCommands();
    }
    return text;
}

function getUserCommands(): string {
    return joinLines(
        h5('User Commands'),
        addBulletSlashCommand('connect'),
        addBulletSlashCommand('disconnect'),
        addBulletSlashCommand('help'),
    ) + '\n';
}

function getAdminCommands(): string {
    return joinLines(
        h5('System Admin Commands'),
        addBulletSlashCommand('configure'),
        addBulletSlashCommand('setup-target'),
        addBulletSlashCommand('subscribe'),
    ) + '\n';
}

function getPostText(): string {
    return joinLines(
        h5('Post Menu Options'),
        textLine('click the (...) on a post'),
        addBullet('Create Zendesk Ticket'),
        addBullet('Zendesk Subscriptions'),
    ) + '\n';
}

function addBullet(text: string): string {
    return `* ${text}`;
}

function addBulletSlashCommand(text: string): string {
    return `* \`/${CommandTrigger} ${text}\``;
}

function h5(text: string): string {
    return `##### ${text}\n`;
}

function h4(text: string): string {
    return `#### ${text}\n`;
}

function textLine(text: string): string {
    return `${text}\n`;
}

function joinLines(...lines: string[]): string {
    return lines.join('\n');
}
