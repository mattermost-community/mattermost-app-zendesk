import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {AppCallResponse} from 'types/apps';

import {CallResponseHandler, newOKCallResponseWithMarkdown} from '../utils/call_responses';

export const expandMe = {
    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
};

export const fMe: CallResponseHandler = async (req, res) => {
    const message = '`access_token:` ' + req.body.context.oauth2.user.token.access_token;
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(message);
    res.json(callResponse);
};
