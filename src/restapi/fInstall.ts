import {Request, Response} from 'express';

import {configStore} from '../store';

export function fInstall(req: Request, res: Response): void {
    configStore.storeInstallInfo(req);
    res.json({});
}

