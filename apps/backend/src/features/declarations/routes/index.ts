import { auth } from '@src/middleware';
import { Router } from 'express';

import {
  approveDeclarationsHandler,
  createUserDeclarationHandler,
  getDeclarationHandler,
  listDeclarationsHandler,
  rejectDeclarationsHandler,
} from './declarations.route';

const router: Router = Router();

router.use(auth);

router.post('/', createUserDeclarationHandler);
router.get('/:id', getDeclarationHandler);
router.get('/', listDeclarationsHandler);
router.post('/:id/approve', approveDeclarationsHandler);
router.post('/:id/reject', rejectDeclarationsHandler);

export default router;
