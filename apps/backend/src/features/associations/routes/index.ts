/**
 * @file Associations Feature Router
 * @description This file aggregates all association sub-routes behind authentication.
 */

import { auth } from '@src/middleware/auth';
import { type Router as ExpressRouter,Router } from 'express';

import {
  getAssociationByUser,
  getAssociationDetail,
  getCurrentAssociation,
  patchAssociationDetail,
  postAddMember,
  postAssociationCreate,
  postDeactivateAssociation,
  postUploadLogo,
} from './associations.route';

/**
 * Express router for associations.
 */
const router: ExpressRouter = Router();

// All association routes require authentication
router.use(auth);

// -- Association collection & creation --------------------------------------

router.get('/', getAssociationByUser);

router.post('/', postAssociationCreate);

// -- Current user's association ---------------------------------------------

router.get('/current', getCurrentAssociation);

// -- Single association CRUD ------------------------------------------------

router.get('/:associationId', getAssociationDetail);

router.patch('/:associationId', patchAssociationDetail);

// -- Association actions ----------------------------------------------------

router.post('/:associationId/deactivate', postDeactivateAssociation);

router.post('/:associationId/logo', postUploadLogo);

router.post('/:associationId/members', postAddMember);

export default router;
