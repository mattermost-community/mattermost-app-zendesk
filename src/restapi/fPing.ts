import {Request, Response} from 'express';

export function fPing(_: Request, res: Response): void {
    res.json({});
}
