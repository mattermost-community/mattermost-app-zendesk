import {Request, Response} from 'express';

import {config} from '../store';

export function fInstall(req: Request, res: Response): void {
    config.storeInstallInfo(req);
    res.json({});
}

