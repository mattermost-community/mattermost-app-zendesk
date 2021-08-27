import {AppCallResponse} from 'mattermost-redux/types/apps';

import {newOKCallResponseWithMarkdown, CallResponseHandler} from '../utils/call_responses';

export const fInstall: CallResponseHandler = async (_, res) => {
    let msg = '**Zendesk is now installed!**\n\n';
    msg += 'To finish configuring the Zendesk app please read the [Quick Start](https://github.com/mattermost/mattermost-app-zendesk#quick-start) section of the README.\n';
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(msg);
    res.json(callResponse);
};

