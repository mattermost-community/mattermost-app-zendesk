import {AppContext} from 'mattermost-redux/types/apps';
import {isAdmin} from 'mattermost-redux/utils/user_utils';
import GeneralConstants from 'mattermost-redux/constants/general';

import {newMMClient} from '../clients';

export async function isUserSysadmin(context: AppContext): Promise<boolean> {
    if (context.acting_user && context.acting_user.roles) {
        return isAdmin(context.acting_user.roles);
    }

    const client = newMMClient(context).asAdmin();
    const user = await client.getUser(context.acting_user_id);
    return user.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE);
}

