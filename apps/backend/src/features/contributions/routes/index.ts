import { Router } from 'express';
import {
  approveDeclarationsHandler,
  createUserDeclarationHandler,
  listDeclarationsHandler,
  listUserDeclarationsHandler,
  rejectDeclarationsHandler,
} from './declarations.route';
import { auth } from '@src/middleware';
import { createManualContributionPaymentHandler } from './contribution-payment.route';

const router: Router = Router();

router.use(auth);

// members
router.post('/declarations', createUserDeclarationHandler);
router.get('/declarations', listUserDeclarationsHandler);
router.get('/all-declarations', listDeclarationsHandler);

// ADMIN
router.post('/declarations/:id/approve', approveDeclarationsHandler);
router.post('/declarations/:id/reject', rejectDeclarationsHandler);
router.post('/payments', createManualContributionPaymentHandler);

export default router;
