import manifest from './manifest.json';

import {getHTTPPath} from './index';

export type Manifest = {
    app_id: string;
    version: string;
    homepage_url: string;
    display_name: string;
    description: string;
    icon: string;
    requested_permissions: string[];
    requested_locations: string[];
    http: {
        root_url?: string;
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

    m.http.root_url = getHTTPPath();

    return m;
}
