// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
import { auth } from '@src/middleware/auth';
import { Router } from 'express';

import { postDowngrade } from './downgrade.route';
import { getMySubscriptionHandler, getUserSubscriptionHandler } from './my-subscription.route';
// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------
import {
  createPlanHandler,
  deletePlanHandler,
  getPlanDetailsHandler,
  getPlansHandler,
  setDefaultPlanHandler,
  updatePlanHandler,
} from './plans.route';
import { postSubscribe } from './subscribe.route';
import { getSubscriptionPaymentsHandler } from './subscription-payments.route';
import { postUpgrade } from './upgrade.route';
import { postWaive } from './waive.route';

// ---- Router setup ------------------------------------------------------------

/** Subscriptions feature router — all routes require authentication. */
const router: Router = Router();

router.use(auth);

// ---- Plans -------------------------------------------------------------------

router.get('/plans', getPlansHandler);
router.post('/plans', createPlanHandler);
router.post('/plans/default', setDefaultPlanHandler);
router.get('/plans/:planId', getPlanDetailsHandler);
router.patch('/plans/:planId', updatePlanHandler);
router.delete('/plans/:planId', deletePlanHandler);

// ---- User Plan ------------------------------------------------------------
router.get('/user/:userId', getUserSubscriptionHandler);
// ---- My subscription ---------------------------------------------------------

router.get('/my', getMySubscriptionHandler);

// ---- Subscription actions ----------------------------------------------------

router.post('/subscribe', postSubscribe);
router.post('/upgrade', postUpgrade);
router.post('/downgrade', postDowngrade);
router.post('/waive', postWaive);

// ---- Payments ----------------------------------------------------------------

router.get('/:subscriptionId/payments', getSubscriptionPaymentsHandler);

export default router;
