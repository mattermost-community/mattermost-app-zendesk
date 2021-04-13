import {isAdmin} from 'mattermost-redux/utils/user_utils';
import GeneralConstants from 'mattermost-redux/constants/general';

import {CtxWithBotAdminActingUserExpanded, CtxWithActingUserExpanded} from 'types/apps';

import {newMMClient} from 'clients';
import {newTokenStore} from 'store';

export async function isUserConnected(context: CtxWithActingUserExpanded): Promise<boolean> {
    const userID = context.acting_user_id;
    const tokenStore = newTokenStore(context);
    const token = await tokenStore.getToken(userID);
    return Boolean(token);
}

export async function isUserSysadmin(context: CtxWithBotAdminActingUserExpanded): Promise<boolean> {
    if (context.acting_user && context.acting_user.roles) {
        return isAdmin(context.acting_user.roles);
    }

    const client = newMMClient(context).asAdmin();
    const user = await client.getUser(context.acting_user_id);
    return user.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE);
}

