import { auth } from '@src/middleware/auth';
import { Router } from 'express';

import { myOverviewRouteHandler, overviewRouteHandler } from './overview.route';

// ---- Routes -----------------------------------------------------------------
// GET /api/dashboard/overview
// Description: Retrieve dashboard summary data for the user's association
// Security: Authenticated user

const router: Router = Router();

router.get('/overview', auth, overviewRouteHandler);

router.get('/overview/my', auth, myOverviewRouteHandler);

export default router;
