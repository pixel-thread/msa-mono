import { Router } from 'express';

import { postAnonymize, postDsarSla } from './cron-jobs.route';

// ---- Routes -----------------------------------------------------------------

const router: Router = Router();

// DSAR SLA deadline check trigger
router.post('/dsar-sla', postDsarSla);

// User anonymization trigger
router.post('/anonymize', postAnonymize);

export default router;
