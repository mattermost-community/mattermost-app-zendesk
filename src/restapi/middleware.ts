import {AppContext} from 'mattermost-redux/types/apps';

import {newErrorCallResponseWithMessage} from '../utils/call_responses';
import {isConnected, isUserSystemAdmin, isZdAdmin} from '../utils';

export const requireZendeskUser = (req, res, next) => {
    const context: AppContext | undefined = req.body?.context;
    const oauth2User = context?.oauth2?.user;
    if (!oauth2User) {
        res.json(newErrorCallResponseWithMessage('no oauth2 user provided'));
        return;
    }

    if (!isConnected(oauth2User)) {
        res.json(newErrorCallResponseWithMessage('user is not connected'));
        return;
    }

    next();
};

export const requireZendeskAdmin = (req, res, next) => {
    const context: AppContext | undefined = req.body?.context;
    const role = context?.oauth2?.user?.role;
    if (!role) {
        res.json(newErrorCallResponseWithMessage('no oauth2 user role provided'));
        return;
    }

    if (!isZdAdmin(role)) {
        res.json(newErrorCallResponseWithMessage('user is not Zendesk admin'));
        return;
    }

    next();
};

export const requireSystemAdmin = (req, res, next) => {
    const context: AppContext | undefined = req.body?.context;
    const actingUser = context?.acting_user;

    if (!actingUser) {
        res.json(newErrorCallResponseWithMessage('no acting user provided'));
        return;
    }

    if (!isUserSystemAdmin(actingUser)) {
        res.json(newErrorCallResponseWithMessage('user is not sysadmin'));
        return;
    }

    next();
};

export const validateWebhookMiddleware = (req, res, next) => {
    next();
};
