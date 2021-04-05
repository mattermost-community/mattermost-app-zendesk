import {Request, Response} from 'express';

import {AppCallRequest} from 'mattermost-redux/types/apps';

import {AppContextWithBot} from 'types/apps';

import {newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {AppID} from '../utils/constants';
import {getManifest} from '../../manifest';

import {isUserSysadmin} from '../app/user';

export async function fHelp(req: Request, res: Response): Promise<void> {
    let helpText = getHeader();
    helpText += getCommands(req.body);
    helpText += getPostText();
    res.json(newOKCallResponseWithMarkdown(helpText));
}

function getHeader(): string {
    const homepageURL = getManifest().homepage_url;
    return h4(`Zendesk [(GitHub Link)](${homepageURL})`);
}

function getCommands(call: AppCallRequest): string {
    const context = call.context as AppContextWithBot;
    let text = getUserCommands();
    if (isUserSysadmin(context)) {
        text += getAdminCommands();
    }
    return text;
}

function getUserCommands(): string {
    let text = h5('User Commands');
    text += addBulletSlashCommand('connect');
    text += addBulletSlashCommand('disconnect');
    text += addBulletSlashCommand('help');
    return text;
}

function getAdminCommands(): string {
    let text = h5('System Admin Commands');
    text += addBulletSlashCommand('connect');
    text += addBulletSlashCommand('subscribe');
    return text;
}

function getPostText(): string {
    let text = h5('Post Menu Options');
    text += 'click the (...) on a post\n';
    text += addBullet('Create Zendesk Ticket');
    text += addBullet('Zendesk Subscriptions');
    return text;
}

function addBullet(text: string): string {
    return `* ${text}\n`;
}

function addBulletSlashCommand(text: string): string {
    return `* \`/${AppID} ${text}\`\n`;
}

function h5(text: string): string {
    return `##### ${text}\n`;
}

function h4(text: string): string {
    return `#### ${text}\n`;
}
