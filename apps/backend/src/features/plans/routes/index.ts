// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
import { auth } from '@src/middleware/auth';
import { Router } from 'express';

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------
import {
  createPlanHandler,
  deletePlanHandler,
  getPlanDetailsHandler,
  getPlansHandler,
  getPlanVersionsHandler,
  setDefaultPlanHandler,
  updatePlanHandler,
} from './plans.route';

/** Plans feature router — all routes require authentication. */
const router: Router = Router();

router.use(auth);

// ---- Plans ------------------------------------------------------------------

router.get('/', getPlansHandler);
router.post('/', createPlanHandler);
router.post('/default', setDefaultPlanHandler);
router.get('/:planId', getPlanDetailsHandler);
router.patch('/:planId', updatePlanHandler);
router.delete('/:planId', deletePlanHandler);
// ---- Plan Versions -----------------------------------------------------------
router.get('/:planId/versions', getPlanVersionsHandler);

export default router;
