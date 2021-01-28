import express from 'express';

import {Routes} from '../utils';

import {fBindings} from './fBindings';
import {fConnect} from './fConnect';
import {fComplete} from './fComplete';
import {fCreateForm} from './fCreateForm';
import {fOpenCreateTicketForm} from './fOpenCreateTicketForm';
import {fDisconnect} from './fDisconnect';
import {fInstall} from './fInstall';
import {fManifest} from './fManifest';

const router = express.Router();

router.get(Routes.App.ManifestPath, fManifest);
router.post(Routes.App.BindingsPath, fBindings);
router.get(Routes.App.OAuthCompletePath, fComplete);

router.post(Routes.App.InstallPath, fInstall);

// Location bound calls
router.post(Routes.App.BindingPathConnect, fConnect);
router.post(Routes.App.BindingPathDisconnect, fDisconnect);
router.post(Routes.App.BindingPathOpenCreateTicketForm, fOpenCreateTicketForm);

// Callable routes, not bound to a location
router.post(Routes.App.CallPathCreateForm, fCreateForm);
export default router;
