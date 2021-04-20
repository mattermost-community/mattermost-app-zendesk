import ClientOAuth2 from 'client-oauth2';

import {CtxWithActingUserExpanded} from 'types/apps';

import {Routes} from 'utils';
import {newConfigStore} from 'store';

export const getOAuthConfig = async (context: CtxWithActingUserExpanded): Promise<ClientOAuth2> => {
    const config = await newConfigStore(context).getValues();
    const options = {
        clientId: context.oauth2.client_id,
        clientSecret: context.oauth2.client_secret,
        accessTokenUri: config.zd_url + Routes.ZD.OAuthAccessTokenURI,
        authorizationUri: config.zd_url + Routes.ZD.OAuthAuthorizationURI,
        redirectUri: context.oauth2.complete_url,
        scopes: ['read', 'write'],
    };

    const zdAuth = new ClientOAuth2(options);
    return zdAuth;
};
