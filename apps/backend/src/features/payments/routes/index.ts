// ---------------------------------------------------------------------------
// Payment Routes Index
// Organises all /api/payments/* route handlers into a single router.
// Route ordering is deliberate: static routes before parameterized routes,
// and providers' :providerId routes before generic :paymentId routes.
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { auth } from '@src/middleware/auth';

// ---- Payments ----
import { listPayments } from './list-payments.route';
import { myPayments } from './my-payments.route';
import { paymentHistory } from './payment-history.route';
import { paymentStats } from './payment-stats.route';
import { getPayment } from './get-payment.route';
import { getReceipt } from './get-receipt.route';

// ---- Razorpay Flow ----
import { createOrder } from './create-order.route';
import { verifyPayment } from './verify-payment.route';
import { webhook } from './webhook.route';
import { recordPayment } from './record-payment.route';

// ---- User-Specific ----
import { userPayments, userContributions } from './user-payments.route';

// ---- Contributions ----
import {
  listContributions,
  generateContributions,
  waiveContributionHandler,
  getContribution,
} from './contributions.route';

// ---- Reports ----
import { collectionsReport } from './collections-report.route';

// ---- Providers ----
import {
  listProviders,
  createProviderHandler,
  providerStatus,
  getProvider,
  updateProviderHandler,
  deleteProviderHandler,
  activateProvider,
  testProvider,
  verifyTestProvider,
} from './providers.route';

const router: Router = Router();

// ===========================================================================
// Static Routes
// ===========================================================================
router.use(auth);
router.get('/', listPayments);
router.get('/my', myPayments);
router.get('/history', paymentHistory);
router.get('/stats', paymentStats);

// ===========================================================================
// Razorpay Flow
// ===========================================================================

router.post('/order', createOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', webhook);
router.post('/record', recordPayment);

// ===========================================================================
// User-Specific
// ===========================================================================

router.get('/users/:userId', userPayments);
router.get('/users/:userId/contributions', userContributions);

// ===========================================================================
// Contributions
// ===========================================================================

router.get('/contributions', listContributions);
router.post('/contributions', generateContributions);
router.patch('/contributions', waiveContributionHandler);
router.get('/contributions/:contributionId', getContribution);

// ===========================================================================
// Reports
// ===========================================================================

router.get('/reports/collections', collectionsReport);

// ===========================================================================
// Providers
// Must come before :paymentId to avoid route collision with /providers
// ===========================================================================

router.get('/providers', listProviders);
router.post('/providers', createProviderHandler);
router.get('/providers/status', providerStatus);
router.get('/providers/:providerId', getProvider);
router.patch('/providers/:providerId', updateProviderHandler);
router.delete('/providers/:providerId', deleteProviderHandler);
router.post('/providers/:providerId/activate', activateProvider);
router.post('/providers/:providerId/test', testProvider);
router.post('/providers/:providerId/test/verify', verifyTestProvider);

// ===========================================================================
// Parameterized Routes (must be last — catch-all /:paymentId)
// ===========================================================================

router.get('/:paymentId', getPayment);
router.get('/:paymentId/receipt', getReceipt);

export default router;
