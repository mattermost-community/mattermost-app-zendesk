import {AppBinding} from 'mattermost-redux/types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {Routes, Locations, ZendeskIcon} from '../utils/constants';
import {getStaticURL} from '../utils';
import {getManifest} from '../manifest';

export const getSubscribeBinding = (mmSiteUrl: string, label?: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Subscribe,
        label: label || 'subscribe',
        description: 'Subscribe notifications to a channel',
        icon: getStaticURL(mmSiteUrl, ZendeskIcon),
        form: {fields: []},
        call: {
            path: Routes.App.CallPathSubsOpenForm,
            expand: {
                admin_access_token: AppExpandLevels.EXPAND_SUMMARY,
                channel: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getConnectBinding = (mmSiteUrl: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Connect,
        label: 'connect',
        description: 'Connect your Zendesk account',
        icon: getStaticURL(mmSiteUrl, ZendeskIcon),
        form: {fields: []},
        call: {
            expand: {
                oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
            },
            path: Routes.App.BindingPathConnect,
        },
    };
};

export const getDisconnectBinding = (mmSiteUrl: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Disconnect,
        label: 'disconnect',
        description: 'Disconnect your Zendesk account',
        icon: getStaticURL(mmSiteUrl, ZendeskIcon),
        form: {fields: []},
        call: {
            expand: {
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
            path: Routes.App.BindingPathDisconnect,
        },
    };
};

export const getConfigureBinding = (mmSiteUrl: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Configure,
        label: 'configure',
        description: 'Configure the installed Zendesk account',
        icon: getStaticURL(mmSiteUrl, ZendeskIcon),
        form: {fields: []},
        call: {
            path: Routes.App.CallPathConfigOpenForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getMeBinding = (mmSiteUrl: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Me,
        label: 'me',
        description: 'Show Your Zendesk User Info',
        icon: getStaticURL(mmSiteUrl, ZendeskIcon),
        form: {fields: []},
        call: {
            path: Routes.App.BindingPathMe,
            expand: {
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getTargetBinding = (mmSiteUrl: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Target,
        label: 'setup-target',
        description: 'Setup Zendesk Target',
        icon: getStaticURL(mmSiteUrl, ZendeskIcon),
        form: {fields: []},
        call: {
            path: Routes.App.BindingPathTargetCreate,
            expand: {
                app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getHelpBinding = (mmSiteUrl: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Help,
        label: 'help',
        description: 'Show Zendesk Help',
        icon: getStaticURL(mmSiteUrl, ZendeskIcon),
        form: {fields: []},
        call: {
            path: Routes.App.BindingPathHelp,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getCreateTicketBinding = (mmSiteUrl: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        label: 'Create Zendesk Ticket',
        description: 'Create ticket in Zendesk',
        icon: getStaticURL(mmSiteUrl, ZendeskIcon),
        location: Locations.Ticket,
        call: {
            path: Routes.App.CallPathTicketOpenForm,
            expand: {
                post: AppExpandLevels.EXPAND_SUMMARY,
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};
