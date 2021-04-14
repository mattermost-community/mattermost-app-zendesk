import ClientOAuth2 from 'client-oauth2';
import {AppContext} from 'mattermost-redux/types/apps';

import {Routes} from '../utils';
import {newConfigStore} from '../store';

export const getOAuthConfig = async (context: AppContext): any => {
    console.log('context.oauth2', context.oauth2);
    const config = await newConfigStore(context).getValues();
    const options = {
        clientId: context.oauth2.client_id,
        clientSecret: context.oauth2.client_secret,
        accessTokenUri: config.zd_url + Routes.ZD.OAuthAccessTokenURI,
        authorizationUri: config.zd_url + Routes.ZD.OAuthAuthorizationURI,

        // redirectUri: config.zd_node_host + Routes.App.OAuthCompletePath,
        // redirectUri: context.oauth2.connect_url,
        redirectUri: context.oauth2.complete_url,
        scopes: ['read', 'write'],
    };
    console.log('options', options);

    const zdAuth = new ClientOAuth2(options);
    return zdAuth;
};

// https://accounts.google.com/o/oauth2/auth?
// access_type=offline
// &client_id=1056909325508-24emroa7a67bbls0mumc91r4k24464u1.apps.googleusercontent.com
// &prompt=consent
// &redirect_uri=https%3A%2F%2Fjasonf.ngrok.io%2Fplugins%2Fcom.mattermost.apps%2Fapps%2Fhello-oauth2%2Foauth2%2Fremote%2Fcomplete
// &response_type=code
// &scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email
// &state=5sD3ESAn1mtyqAiF4E-t.rgixs6uimp88tq8x8w3yxu3oqe

