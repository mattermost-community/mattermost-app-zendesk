import express from 'express';

import {Routes} from '../utils';

import {fBindings} from './fBindings';
import {fConnect} from './fConnect';
import {fComplete} from './fComplete';
import {fOpenCreateTicketForm, fSubmitOrUpdateCreateTicketForm} from './fCreateTicket';
import {fOpenSubscriptionsForm, fSubmitOrUpdateSubcriptionsForm} from './fSubscriptions';
import {fHandleSubcribeNotification} from './fIncomingWebhooks';
import {fDisconnect} from './fDisconnect';
import {fHelp} from './fHelp';
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
router.post(Routes.App.BindingPathOpenSubcriptionsForm, fOpenSubscriptionsForm);
router.post(Routes.App.BindingPathHelp, fHelp);

// Callable routes, not bound to a location
router.post(Routes.App.CallPathSubmitOrUpdateCreateTicketForm, fSubmitOrUpdateCreateTicketForm);
router.post(Routes.App.CallPathSubmitOrUpdateSubcriptionForm, fSubmitOrUpdateSubcriptionsForm);

// zendesk
router.post(Routes.App.SubscribeIncomingWebhookPath, fHandleSubcribeNotification);
export default router;
