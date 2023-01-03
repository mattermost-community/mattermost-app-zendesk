import manifest from './manifest.json';

import {getHTTPPath, isRunningInHTTPMode} from './index';

export type Manifest = {
    app_id: string;
    version: string;
    homepage_url: string;
    display_name: string;
    description: string;
    icon: string;
    requested_permissions: string[];
    requested_locations: string[];
    http?: {
        root_url: string;
        use_jwt: boolean;
    }
    aws_lambda: {
        functions: {
            path: string;
            name: string;
            handler: string;
            runtime: string;
        }[];
    }
}

export function getManifest(): Manifest {
    const m: Manifest = manifest;

    if (isRunningInHTTPMode()) {
        m.http = {
            root_url: getHTTPPath(),
            use_jwt: true,
        };
    }

    return m;
}
