import { auth } from '@src/middleware';
import { Router } from 'express';

import { recordContributionHandler } from './contribution-payment.route';
import {
  generateContributionsHandler,
  generateUserContributionsHandler,
  getContributionHandler,
  listContributionsHandler,
  myContributionsHandler,
  myContributionsOverviewHandler,
  waiveContributionHandler,
} from './contributions.route';
import { retroactiveAffectedUsersHandler } from './retroactive.route';
import { listUserContributionsHandler } from './user-contributions.route';

const router: Router = Router();

router.use(auth);

// Contributions
router.get('/', listContributionsHandler);
router.get('/my', myContributionsHandler);
router.get('/my/overview', myContributionsOverviewHandler);
router.post('/generate-periodic', generateContributionsHandler);
router.patch('/waive', waiveContributionHandler);
router.get('/:contributionId', getContributionHandler);

// User Contributions
router.get('/users/:userId', listUserContributionsHandler);
router.post('/users/:userId', generateUserContributionsHandler);

// ADMIN
router.post('/record', recordContributionHandler);

// Retroactive
router.post('/retroactive/affected-users', retroactiveAffectedUsersHandler);

export default router;
