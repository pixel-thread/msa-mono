import { Router } from 'express';
import { auth } from '@src/middleware';

import {
  approveDeclarationsHandler,
  createUserDeclarationHandler,
  listDeclarationsHandler,
  listUserDeclarationsHandler,
  rejectDeclarationsHandler,
} from './declarations.route';

import { createManualContributionPaymentHandler } from './contribution-payment.route';

import {
  listContributionsHandler,
  generateContributionsHandler,
  waiveContributionHandler,
  getContributionHandler,
  generateUserContributionsHandler,
} from './contributions.route';

import { listUserContributionsHandler } from './user-contributions.route';

const router: Router = Router();

router.use(auth);

// members
router.post('/declarations', createUserDeclarationHandler);
router.get('/declarations', listUserDeclarationsHandler);
router.get('/all-declarations', listDeclarationsHandler);

// Contributions
router.get('/contributions', listContributionsHandler);
router.post('/contributions', generateContributionsHandler);
router.patch('/contributions', waiveContributionHandler);
router.get('/contributions/:contributionId', getContributionHandler);

// User Contributions
router.get('/users/:userId', listUserContributionsHandler);
router.post('/users/:userId', generateUserContributionsHandler);

// ADMIN
router.post('/declarations/:id/approve', approveDeclarationsHandler);
router.post('/declarations/:id/reject', rejectDeclarationsHandler);
router.post('/record', createManualContributionPaymentHandler);

export default router;
