import {Request, Response} from 'express';
import {AppCallResponse, AppCall} from 'mattermost-redux/types/apps';

import {newConfigStore, AppConfigStore} from '../store/config';
import {newZendeskConfigForm} from '../forms';
import {newOKCallResponse, newFormCallResponse, newErrorCallResponseWithMessage} from '../utils/call_responses';

// fOpenZendeskConfigForm opens a new configuration form
export async function fOpenZendeskConfigForm(req: Request, res: Response): Promise<void> {
    const form = await newZendeskConfigForm(req.body);
    const callResponse = newFormCallResponse(form);
    res.json(callResponse);
}

export async function fSubmitOrUpdateZendeskConfigForm(req: Request, res: Response): Promise<void> {
    const form = await newZendeskConfigForm(req.body);
    const callResponse = newFormCallResponse(form);
    res.json(callResponse);
}

export async function fSubmitOrUpdateZendeskConfigSubmit(req: Request, res: Response): Promise<void> {
    const call: AppCall = req.body;
    let callResponse: AppCallResponse = newOKCallResponse();
    try {
        const context = call.context;
        const configStore = newConfigStore(context);
        const storeValues = call.values as AppConfigStore;
        configStore.storeConfigInfo(storeValues);
    } catch (err) {
        callResponse = newErrorCallResponseWithMessage(err.message);
    }
    res.json(callResponse);
}
