import { Router } from 'express';

import { postAnonymize,postDsarSla, postSubscriptionExpiry } from './cron-jobs.route';

// ---- Routes -----------------------------------------------------------------

const router: Router = Router();

// Subscription expiry trigger
router.post('/subscription-expiry', postSubscriptionExpiry);

// DSAR SLA deadline check trigger
router.post('/dsar-sla', postDsarSla);

// User anonymization trigger
router.post('/anonymize', postAnonymize);

export default router;
