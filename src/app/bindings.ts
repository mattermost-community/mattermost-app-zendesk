import {AppBinding, AppState, AppsState} from 'mattermost-redux/types/apps';

class Bindings {
    // getBindings returns bindings defined for all locations in the app
    getBindings(): AppState {
        const state: AppsState = [
            this.postMenuBindings(),
        ];
        return state;
    }

    // postMenuBindings returns bindings for the post_menu location
    postMenuBindings(): AppBinding {
        const binding: AppBinding = {
            location_id: '/post_menu',
            bindings: [
                {
                    label: 'Create Zendesk Ticket',
                    description: 'Create ticket in zendesk',
                    icon: 'https://raw.githubusercontent.com/jfrerich/mattermost-applet-zendesk/initial-PR/assets/zendesk.svg',
                    call: {
                        url: 'https://jasonf.ngrok.io/createform',
                        type: 'form',
                        expand: {
                            app: '',
                            post: 'All',
                        },
                    },
                },
            ],
        };
        return binding;
    }
}

export default new Bindings();
