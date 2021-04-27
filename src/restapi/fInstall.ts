import {Request, Response} from 'express';

import {newOKCallResponseWithMarkdown} from '../utils/call_responses';

export async function fInstall(_: Request, res: Response): Promise<void> {
    let msg = '**Zendesk is now installed!**\n\n';
    msg += 'To finish configuring the Zendesk app please read the [Quick Start](https://github.com/mattermost/mattermost-app-zendesk#quick-start) section of the README.\n';
    res.json(newOKCallResponseWithMarkdown(msg));
}

