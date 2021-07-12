import {Request, Response} from 'express';
import {AppCallRequest} from 'mattermost-redux/types/apps';

import {ExpandedBotAdminActingUser} from '../types/apps';
import {newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {getManifest} from '../manifest';
import {CommandTrigger} from '../utils/constants';
import {isUserSystemAdmin} from '../utils';

export async function fHelp(req: Request, res: Response): Promise<void> {
    const helpText = [
        getHeader(),
        getCommands(req.body),
        getPostText(),
    ].join('\n');
    res.json(newOKCallResponseWithMarkdown(helpText));
}

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
    return [
        h5('User Commands'),
        addBulletSlashCommand('connect'),
        addBulletSlashCommand('disconnect'),
        addBulletSlashCommand('help'),
    ].join('\n') + '\n';
}

function getAdminCommands(): string {
    return [
        h5('System Admin Commands'),
        addBulletSlashCommand('configure'),
        addBulletSlashCommand('setup-target'),
        addBulletSlashCommand('subscribe'),
    ].join('\n') + '\n';
}

function getPostText(): string {
    return [
        h5('Post Menu Options'),
        'click the (...) on a post\n',
        addBullet('Create Zendesk Ticket'),
        addBullet('Zendesk Subscriptions'),
    ].join('\n') + '\n';
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
