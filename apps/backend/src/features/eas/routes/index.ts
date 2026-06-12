import { auth } from '@middleware/auth';
import { Router } from 'express';

import { webhook } from './webhook.route';

const router: Router = Router();

router.post('/webhook', webhook);

router.use(auth);

export default router;
