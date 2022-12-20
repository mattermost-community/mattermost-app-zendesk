import express from 'express';

import {Routes} from '../utils';

import {fBindings} from './fBindings';
import {fConnect, fOauth2Complete, fOauth2Connect} from './fConnect';
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
import {requireSystemAdmin, validateWebhookMiddleware, requireZendeskAdmin, requireZendeskUser} from './middleware';

const router = express.Router();

// System
router.get(Routes.App.ManifestPath, fManifest);
router.post(Routes.App.InstallPath, fInstall);

// User: Bindings
router.post(Routes.App.BindingsPath, fBindings);

// User: OAuth2 Connect
router.post(Routes.App.OAuthConnectPath, fOauth2Connect);
router.post(Routes.App.OAuthCompletePath, fOauth2Complete);

// User: Formless calls
router.post(Routes.App.BindingPathConnect + '/submit', fConnect);
router.post(Routes.App.BindingPathDisconnect + '/submit', fDisconnect);
router.post(Routes.App.BindingPathHelp + '/submit', fHelp);
router.post(Routes.App.BindingPathMe + '/submit', fMe);

// System Admin: Configuration
router.post(Routes.App.CallPathConfigOpenForm + '/submit', requireSystemAdmin, fOpenZendeskConfigForm);
router.post(Routes.App.CallPathConfigSubmitOrUpdateForm + '/submit', requireSystemAdmin, fSubmitOrUpdateZendeskConfigSubmit);

// Zendesk Admin: Create Target
router.post(Routes.App.CallPathTargetCreate + '/submit', requireZendeskAdmin, fCreateTarget);

// Zendesk User: Subscriptions
router.post(Routes.App.CallPathSubsOpenForm + '/submit', requireZendeskUser, fOpenSubscriptionsForm);
router.post(Routes.App.CallPathSubsSubmitOrUpdateForm + '/form', requireZendeskUser, fSubmitOrUpdateSubscriptionsForm);
router.post(Routes.App.CallPathSubsSubmitOrUpdateForm + '/submit', requireZendeskUser, fSubmitOrUpdateSubscriptionsSubmit);

// Zendesk User: Tickets
router.post(Routes.App.CallPathTicketOpenForm + '/submit', requireZendeskUser, fOpenCreateTicketForm);
router.post(Routes.App.CallPathTicketSubmitOrUpdateForm + '/form', requireZendeskUser, fSubmitOrUpdateCreateTicketForm);
router.post(Routes.App.CallPathTicketSubmitOrUpdateForm + '/submit', requireZendeskUser, fSubmitOrUpdateCreateTicketSubmit);

// General: Static files
const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

// Webhooks: Zendesk
router.post(Routes.App.SubscribeIncomingWebhookPath, validateWebhookMiddleware, fHandleSubcribeNotification);
export default router;
