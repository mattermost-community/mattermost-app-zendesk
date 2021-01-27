import express from 'express';

import {routes} from '../utils';

import {fBindings} from './fBindings';
import {fConnect} from './fConnect';
import {fComplete} from './fComplete';
import {fCreateForm} from './fCreateForm';
import {fOpenCreateTicketForm} from './fOpenCreateTicketForm';
import {fDisconnect} from './fDisconnect';
import {fInstall} from './fInstall';
import {fManifest} from './fManifest';

const router = express.Router();

router.get(routes.app.ManifestPath, fManifest);
router.post(routes.app.BindingsPath, fBindings);
router.get(routes.app.OAuthCompletePath, fComplete);

router.post(routes.app.InstallPath, fInstall);

// Location bound calls
router.post(routes.app.BindingPathConnect, fConnect);
router.post(routes.app.BindingPathDisconnect, fDisconnect);
router.post(routes.app.BindingPathOpenCreateTicketForm, fOpenCreateTicketForm);

// Callable routes, not bound to a location
router.post(routes.app.CallPathCreateForm, fCreateForm);
export default router;
