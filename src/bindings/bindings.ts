import {AppBinding} from 'types/apps';
import {AppExpandLevels} from 'mattermost-redux/constants/apps';

import {Locations, Routes, ZendeskIcon} from '../utils/constants';
import {getManifest} from '../manifest';

export const getSubscribeBinding = (label?: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Subscribe,
        label: label || 'subscribe',
        description: 'Subscribe notifications to a channel',
        icon: ZendeskIcon,
        submit: {
            path: Routes.App.CallPathSubsOpenForm + '/submit',
            expand: {
                channel: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getConnectBinding = (): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Connect,
        label: 'connect',
        description: 'Connect your Zendesk account',
        icon: ZendeskIcon,
        submit: {
            expand: {
                oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
            },
            path: Routes.App.BindingPathConnect + '/submit',
        },
    };
};

export const getDisconnectBinding = (): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Disconnect,
        label: 'disconnect',
        description: 'Disconnect your Zendesk account',
        icon: ZendeskIcon,
        submit: {
            expand: {
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
            path: Routes.App.BindingPathDisconnect + '/submit',
        },
    };
};

export const getConfigureBinding = (): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Configure,
        label: 'configure',
        description: 'Configure the installed Zendesk account',
        icon: ZendeskIcon,
        submit: {
            path: Routes.App.CallPathConfigOpenForm + '/submit',
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getMeBinding = (): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Me,
        label: 'me',
        description: 'Show Your Zendesk User Info',
        icon: ZendeskIcon,
        submit: {
            path: Routes.App.BindingPathMe + '/submit',
            expand: {
                oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getTargetBinding = (): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Target,
        label: 'setup-target',
        description: 'Setup Zendesk Target',
        icon: ZendeskIcon,
        submit: {
            path: Routes.App.BindingPathTargetCreate + '/submit',
            expand: {
                app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getHelpBinding = (): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Help,
        label: 'help',
        description: 'Show Zendesk Help',
        icon: ZendeskIcon,
        submit: {
            path: Routes.App.BindingPathHelp + '/submit',
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getCreateTicketBinding = (): AppBinding => {
    return {
        app_id: getManifest().app_id,
        label: 'Create Zendesk Ticket',
        description: 'Create ticket in Zendesk',
        icon: ZendeskIcon,
        location: Locations.Ticket,
        submit: {
            path: Routes.App.CallPathTicketOpenForm + '/submit',
            expand: {
                post: AppExpandLevels.EXPAND_SUMMARY,
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};
