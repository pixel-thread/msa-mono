// ---------------------------------------------------------------------------
// Payment Routes Index
// Organises all /api/payments/* route handlers into a single router.
// Route ordering is deliberate: static routes before parameterized routes,
// and providers' :providerId routes before generic :paymentId routes.
// ---------------------------------------------------------------------------

import { auth } from '@middleware/auth';
import { Router } from 'express';

// ---- Reports ----
import { collectionsReport } from './collections-report.route';
// ---- Razorpay Flow ----
import { createOrder } from './create-order.route';
import { getPayment } from './get-payment.route';
import { getReceipt } from './get-receipt.route';
// ---- Payments ----
import { listPayments } from './list-payments.route';
import { myPayments } from './my-payments.route';
import { paymentHistory } from './payment-history.route';
import { paymentStats } from './payment-stats.route';
// ---- Providers ----
import {
  activateProvider,
  createProviderHandler,
  deleteProviderHandler,
  getProvider,
  listProviders,
  providerStatus,
  testProvider,
  updateProviderHandler,
  verifyTestProvider,
} from './providers.route';
import { recordPayment } from './record-payment.route';
// ---- User-Specific ----
import { userPayments } from './user-payments.route';
import { verifyPayment } from './verify-payment.route';
import { webhook } from './webhook.route';

const router: Router = Router();

// ===========================================================================
// Static Routes
// ===========================================================================
// webhook does not need auth check will be send from razorpay
router.post('/webhook', webhook);

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
router.post('/record', recordPayment);

// ===========================================================================
// User-Specific
// ===========================================================================

router.get('/users/:userId', userPayments);

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
