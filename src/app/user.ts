import {AppContext} from 'mattermost-redux/types/apps';
import GeneralConstants from 'mattermost-redux/constants/general';

import {newMMClient} from '../clients';
import {newTokenStore} from '../store';

export async function isUserConnected(context: AppContext): Promise<boolean> {
    const userID = context.acting_user_id;
    const tokenStore = newTokenStore(context);
    const token = await tokenStore.getToken(userID);
    return Boolean(token);
}

export async function isUserSysadmin(context: AppContext): Promise<boolean> {
    const client = newMMClient(context).asAdmin();
    const user = await client.getUser(context.acting_user_id);
    return user.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE);
}
