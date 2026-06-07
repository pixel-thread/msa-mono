// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { auth } from '@src/middleware/auth';
import { Router } from 'express';

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------
import {
  deleteMemberType,
  getMemberTypeById,
  getMemberTypes,
  patchMemberType,
  postMemberType,
} from './member-types.route';

// ---------------------------------------------------------------------------
// Router setup – all routes require authentication
// ---------------------------------------------------------------------------

const router: Router = Router();

router.use(auth);

// ---- List / Create ----------------------------------------------------------

router.get('/', getMemberTypes);
router.post('/', postMemberType);

// ---- Single-resource operations --------------------------------------------

router.get('/:memberTypeId', getMemberTypeById);
router.patch('/:memberTypeId', patchMemberType);
router.delete('/:memberTypeId', deleteMemberType);

export default router;
