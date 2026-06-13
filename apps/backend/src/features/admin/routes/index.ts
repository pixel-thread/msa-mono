/**
 * @file Admin Router
 * @description This file aggregates all admin-related feature routes behind a central router.
 * It ensures all admin routes are protected by the authentication middleware.
 */

import { auth } from '@src/middleware/auth';
import { Router } from 'express';

import {
  deleteAssociationById,
  getAssociationById,
  getAssociations,
  postAssociation,
  postAssociationMember,
  putAssociation,
} from './associations.route';
import {
  getMembershipApplicationsHandler,
  postApproveApplication,
  postRejectApplication,
} from './membership-applications.route';
import { importUsersCsv } from './users.route';

/**
 * @description Central router for all admin features.
 */
const router: Router = Router();

// All admin routes require authentication — every handler inherits this guard
router.use(auth);

// ---------------------------------------------------------------------------
// Associations CRUD
// ---------------------------------------------------------------------------

router.get('/associations', getAssociations);

router.post('/associations', postAssociation);

router.get('/associations/:id', getAssociationById);

router.put('/associations/:id', putAssociation);

router.delete('/associations/:id', deleteAssociationById);

router.post('/associations/:id/member', postAssociationMember);

// ---------------------------------------------------------------------------
// Users — CSV import
// ---------------------------------------------------------------------------

router.post('/users/import-csv', importUsersCsv);

// ---------------------------------------------------------------------------
// Membership Applications — review workflow
// ---------------------------------------------------------------------------

router.get('/membership-applications', getMembershipApplicationsHandler);

router.post('/membership-applications/:applicationId/approve', postApproveApplication);

router.post('/membership-applications/:applicationId/reject', postRejectApplication);

export default router;
