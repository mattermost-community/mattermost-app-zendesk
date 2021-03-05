import {AppBindingLocations} from 'mattermost-redux/constants/apps';

import {getHTTPPath, isRunningInHTTPMode} from './index'

import manifest from './manifest.json'

export type Manifest = {
    app_id: string;
    app_type: string;
    display_name: string;
    description: string;
    root_url: string;
    requested_permissions: string[];
    homepage_url: string;
    requested_locations: string[];
}

export function getManifest(): Manifest {
    const m:Manifest = manifest;

    if (isRunningInHTTPMode()) {
        m.app_type = 'http';
        manifest.root_url = getHTTPPath();
    }

    return manifest;
}
