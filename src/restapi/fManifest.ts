import {Request, Response} from 'express';

import {getManifest} from 'manifest';

export function fManifest(_: Request, res: Response): void {
    res.json(getManifest());
}
