import express from 'express';

import {Routes} from '../utils';

import {fBindings} from './fBindings';
import {fConnect} from './fConnect';
import {fComplete} from './fComplete';
import {fOpenCreateTicketForm, fSubmitOrUpdateCreateTicketForm, fSubmitOrUpdateCreateTicketSubmit} from './fCreateTicket';
import {fOpenSubscriptionsForm, fSubmitOrUpdateSubscriptionsForm, fSubmitOrUpdateSubscriptionsSubmit} from './fSubscriptions';
import {fOpenZendeskConfigForm, fSubmitOrUpdateZendeskConfigForm, fSubmitOrUpdateZendeskConfigSubmit} from './fConfig';
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

// formless calls
router.post(Routes.App.BindingPathConnectSubmit, fConnect);
router.post(Routes.App.BindingPathDisconnectSubmit, fDisconnect);
router.post(Routes.App.BindingPathHelpSubmit, fHelp);

// configuration
router.post(Routes.App.CallPathConfigOpenFormSubmit, fOpenZendeskConfigForm);
router.post(Routes.App.CallPathConfigSubmitOrUpdateForm, fSubmitOrUpdateZendeskConfigForm);
router.post(Routes.App.CallPathConfigSubmitForm, fSubmitOrUpdateZendeskConfigSubmit);

// subscriptions
router.post(Routes.App.CallPathSubsOpenFormSubmit, fOpenSubscriptionsForm);
router.post(Routes.App.CallPathSubsUpdateForm, fSubmitOrUpdateSubscriptionsForm);
router.post(Routes.App.CallPathSubsSubmitForm, fSubmitOrUpdateSubscriptionsSubmit);

// tickets
router.post(Routes.App.CallPathTicketOpenFormSubmit, fOpenCreateTicketForm);
router.post(Routes.App.CallPathTicketUpdateForm, fSubmitOrUpdateCreateTicketForm);
router.post(Routes.App.CallPathTicketSubmitForm, fSubmitOrUpdateCreateTicketSubmit);

// zendesk
router.post(Routes.App.SubscribeIncomingWebhookPath, fHandleSubcribeNotification);
export default router;
