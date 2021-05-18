import express from 'express';

import {Routes} from '../utils';

import {fBindings} from './fBindings';
import {fConnect, fOauth2Connect, fOauth2Complete} from './fConnect';
import {fOpenCreateTicketForm, fSubmitOrUpdateCreateTicketForm, fSubmitOrUpdateCreateTicketSubmit} from './fCreateTicket';
import {fOpenSubscriptionsForm, fSubmitOrUpdateSubscriptionsForm, fSubmitOrUpdateSubscriptionsSubmit} from './fSubscriptions';
import {fOpenZendeskConfigForm, fSubmitOrUpdateZendeskConfigSubmit} from './fConfig';
import {fHandleSubcribeNotification} from './fIncomingWebhooks';
import {fDisconnect} from './fDisconnect';
import {fHelp} from './fHelp';
import {fCreateTarget} from './fTarget';
import {fMe} from './fMe';
import {fInstall} from './fInstall';
import {fManifest} from './fManifest';

const router = express.Router();

router.get(Routes.App.ManifestPath, fManifest);
router.post(Routes.App.BindingsPath, fBindings);

// oauth2 Connect
router.post(Routes.App.OAuthConnectPath, fOauth2Connect);
router.post(Routes.App.OAuthCompletePath, fOauth2Complete);

router.post(Routes.App.InstallPath, fInstall);

// formless calls
router.post(Routes.App.BindingPathConnect + '/submit', fConnect);
router.post(Routes.App.BindingPathDisconnect + '/submit', fDisconnect);
router.post(Routes.App.BindingPathHelp + '/submit', fHelp);
router.post(Routes.App.BindingPathTargetCreate + '/submit', fCreateTarget);
router.post(Routes.App.BindingPathMe + '/submit', fMe);

// configuration
router.post(Routes.App.CallPathConfigOpenForm + '/submit', fOpenZendeskConfigForm);
router.post(Routes.App.CallPathConfigSubmitOrUpdateForm + '/submit', fSubmitOrUpdateZendeskConfigSubmit);

// subscriptions
router.post(Routes.App.CallPathSubsOpenForm + '/submit', fOpenSubscriptionsForm);
router.post(Routes.App.CallPathSubsSubmitOrUpdateForm + '/form', fSubmitOrUpdateSubscriptionsForm);
router.post(Routes.App.CallPathSubsSubmitOrUpdateForm + '/submit', fSubmitOrUpdateSubscriptionsSubmit);

// tickets
router.post(Routes.App.CallPathTicketOpenForm + '/submit', fOpenCreateTicketForm);
router.post(Routes.App.CallPathTicketSubmitOrUpdateForm + '/form', fSubmitOrUpdateCreateTicketForm);
router.post(Routes.App.CallPathTicketSubmitOrUpdateForm + '/submit', fSubmitOrUpdateCreateTicketSubmit);

// static files
const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

// zendesk
router.post(Routes.App.SubscribeIncomingWebhookPath, fHandleSubcribeNotification);
export default router;
