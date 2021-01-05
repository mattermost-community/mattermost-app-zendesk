import {newMMClient} from '../clients';
import {oauthStore} from '../store';

export function isUserConnected(userID: string): boolean {
    return Boolean(oauthStore.getToken(userID));
}

export async function isUserSysadmin(userID: string): Promise<boolean> {
    const client = newMMClient().asAdmin();
    const user = await client.getUser(userID);
    return user.roles.includes('system_admin');
}
