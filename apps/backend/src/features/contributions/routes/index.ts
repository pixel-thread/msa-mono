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
import {
  listContributions,
  generateContributions,
  waiveContributionHandler,
  getContribution,
  generateUserContributionsHandler,
} from './contributions.route';
import { userContributions } from './user-contributions.route';

const router: Router = Router();

router.use(auth);

// members
router.post('/declarations', createUserDeclarationHandler);
router.get('/declarations', listUserDeclarationsHandler);
router.get('/all-declarations', listDeclarationsHandler);

// Contributions
router.get('/contributions', listContributions);
router.post('/contributions', generateContributions);
router.patch('/contributions', waiveContributionHandler);
router.get('/contributions/:contributionId', getContribution);

// User Contributions
router.get('/users/:userId', userContributions);
router.post('/users/:userId', generateUserContributionsHandler);

// ADMIN
router.post('/declarations/:id/approve', approveDeclarationsHandler);
router.post('/declarations/:id/reject', rejectDeclarationsHandler);
router.post('/payments', createManualContributionPaymentHandler);

export default router;
