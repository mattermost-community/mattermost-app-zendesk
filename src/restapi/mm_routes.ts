import express from 'express';

import {routes} from '../utils';

import {fBindings} from './fBindings';
import {fConnect} from './fConnect';
import {fComplete} from './fComplete';
import {fCreateForm} from './fCreateForm';
import {fDisconnect} from './fDisconnect';
import {fInstall} from './fInstall';
import {fManifest} from './fManifest';

const router = express.Router();

router.get(routes.app.ManifestPath, fManifest);
router.get(routes.app.BindingsPath, fBindings);
router.get(routes.app.OAuthCompletePath, fComplete);

router.post(routes.app.InstallPath, fInstall);
router.post(routes.app.BindingPathConnect, fConnect);
router.post(routes.app.BindingPathDisconnect, fDisconnect);
router.post(routes.app.BindingPathCreateForm, fCreateForm);

export default router;
