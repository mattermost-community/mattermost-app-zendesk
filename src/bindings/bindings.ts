import {AppBinding, AppState, AppsState} from 'mattermost-redux/types/apps';

import {getManifest} from '../../manifest';

// getBindings returns bindings defined for all locations in the app
export function getBindings(): AppBinding[] {
    const bindings: AppBinding = [
        postMenuBindings(),
    ];
    return bindings;
}

// postMenuBindings returns bindings for the post_menu location
function postMenuBindings(): AppBinding {
    const binding: AppBinding = {
        location: '/post_menu',
        bindings: [
            {
                label: 'Create Zendesk Ticket',
                description: 'Create ticket in zendesk',
                icon: 'https://raw.githubusercontent.com/mattermost/mattermost-app-zendesk/initial-PR/assets/zendesk.svg',
                call: {
                    url: getManifest().root_url + '/createform',
                    type: 'form',
                    expand: {
                        post: 'All',
                    },
                },
            },
        ],
    };
    return binding;
}
