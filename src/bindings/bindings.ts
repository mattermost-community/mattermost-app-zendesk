import {AppBinding} from 'types/apps';

import {Locations, Routes, ZendeskIcon} from '../utils/constants';
import {getManifest} from '../manifest';
import {AppImpl} from '../app/app';
import {expandConnect} from '../restapi/fConnect';
import {expandDisconnect} from '../restapi/fDisconnect';
import {expandConfigure} from '../restapi/fConfig';
import {expandMe} from '../restapi/fMe';
import {expandTarget} from '../restapi/fTarget';
import {expandHelp} from '../restapi/fHelp';

export const getSubscribeBinding = (label?: string): AppBinding => {
    return {
        app_id: getManifest().app_id,
        location: Locations.Subscribe,
        label: label || 'subscribe',
        description: 'Subscribe notifications to a channel',
        icon: ZendeskIcon,
        submit: {
            path: Routes.App.CallPathSubsOpenForm + '/submit',
            expand: AppImpl.expandSubscriptionForm,
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
            path: Routes.App.BindingPathConnect + '/submit',
            expand: expandConnect,
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
            path: Routes.App.BindingPathDisconnect + '/submit',
            expand: expandDisconnect,
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
            expand: expandConfigure,
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
            expand: expandMe,
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
            expand: expandTarget,
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
            expand: expandHelp,
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
            expand: AppImpl.expandCreateTicket,
        },
    };
};
