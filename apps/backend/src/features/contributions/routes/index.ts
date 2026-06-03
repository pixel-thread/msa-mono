import { Router } from 'express';
import {
  approveDeclarationsHandler,
  createUserDeclarationHandler,
  listDeclarationsHandler,
  listUserDeclarationsHandler,
  rejectDeclarationsHandler,
} from './declarations.route';
import { auth } from '@src/middleware';
import {
  createManualContributionPaymentHandler,
  verifyManualContributionPaymentHandler,
} from './contribution-payment.route';

const router: Router = Router();

router.use(auth);

// members
router.post('/declarations', createUserDeclarationHandler);
router.get('/declarations', listUserDeclarationsHandler);
router.get('/all-declarations', listDeclarationsHandler);

// ADMIN
router.post('/declarations/:id/approve', approveDeclarationsHandler);
router.post('/declarations/:id/reject', rejectDeclarationsHandler);
//
// // ADMIN Record Contribution payment
router.post('/payments', createManualContributionPaymentHandler);
router.post('/payments/:paymentId/verify', verifyManualContributionPaymentHandler);
// router.get('/payments/:paymentId/verify');
// router.get('/payments/:paymentId/allocations');
// router.get('/contributions/outstanding');

export default router;
