import { auth } from '@src/middleware';
import { Router } from 'express';

import { recordContributionHandler } from './contribution-payment.route';
import {
  generateContributionsHandler,
  generateUserContributionsHandler,
  getContributionHandler,
  listContributionsHandler,
  waiveContributionHandler,
} from './contributions.route';
import {
  approveDeclarationsHandler,
  createUserDeclarationHandler,
  getDeclarationHandler,
  listDeclarationsHandler,
  rejectDeclarationsHandler,
} from './declarations.route';
import { listUserContributionsHandler } from './user-contributions.route';

const router: Router = Router();

router.use(auth);

// members
router.post('/declarations', createUserDeclarationHandler);
router.get('/declarations/:id', getDeclarationHandler);
router.get('/declarations', listDeclarationsHandler);

// Contributions
router.get('/', listContributionsHandler);
router.post('/generate-periodic', generateContributionsHandler);
router.patch('/waive', waiveContributionHandler);
router.get('/:contributionId', getContributionHandler);

// User Contributions
router.get('/users/:userId', listUserContributionsHandler);
// Cron Job for generating user contributions at the end of the month
router.post('/users/:userId', generateUserContributionsHandler);

// ADMIN
router.post('/declarations/:id/approve', approveDeclarationsHandler);
router.post('/declarations/:id/reject', rejectDeclarationsHandler);
router.post('/record', recordContributionHandler);

export default router;
