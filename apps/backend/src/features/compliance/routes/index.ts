import { auth } from '@src/middleware/auth';
import { Router } from 'express';

import { deleteCheck,getCheck, listChecks, runChecks } from './checks.route';
import { getEvidence } from './evidence.route';
import { getMyComplaint,listMyComplaints } from './my-complaints.route';
import { createComplaintHandler,listComplaints } from './overview.route';

/** Compliance router — aggregates all compliance-related route handlers. */
const router: Router = Router();

router.use(auth);

router.get('/', listComplaints);
router.post('/', createComplaintHandler);

router.get('/checks', listChecks);
router.post('/checks', runChecks);
router.get('/checks/:checkId', getCheck);
router.delete('/checks/:checkId', deleteCheck);

router.get('/evidence', getEvidence);

router.get('/my', listMyComplaints);
router.get('/my/:complaintId', getMyComplaint);

export default router;
