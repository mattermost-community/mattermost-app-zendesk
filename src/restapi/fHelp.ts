import {Request, Response} from 'express';

import {newOKCallResponseWithMarkdown} from '../utils/call_responses';
import {AppID} from '../utils/constants';
import {getManifest} from '../../manifest';

import {isUserSysadmin} from '../app/user';

export async function fHelp(req: Request, res: Response): Promise<void> {
    let helpText = getHelpText();
    helpText += getSysadminCommands(req.body.context.acting_user_id);

    res.json(newOKCallResponseWithMarkdown(helpText));
}

function getHelpText(): string {
    const homepageURL = getManifest().homepage_url;
    return `

#### Zendesk [(GitHub Link)](${homepageURL})

##### Slash Commands

* \`/${AppID} connect\`
* \`/${AppID} disconnect\`
* \`/${AppID} help\`

#####  Create a zendesk ticket from a post
* click the (... menu) on a post > Create Zendesk Ticket
  `;
}

function getSysadminCommands(userID: string): string {
    const text = `

##### System Admin Commands
* \`/${AppID} subscribe\`
`;

    if (isUserSysadmin(userID)) {
        return text;
    }
    return '';
}

