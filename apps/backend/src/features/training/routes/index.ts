// ---- External libs ----
import { Router } from 'express';

// ---- Shared utilities ----
import { auth } from '@src/middleware/auth';

// ---- Route handlers ----
import { getModules, postModules } from './modules.route';
import { getModule, updateModuleHandler, deleteModuleHandler } from './module-detail.route';
import {
  getAssignments,
  postAssign,
  putBulkAssign,
  deleteAssignment,
  patchBulkRemove,
  getAssignedUsersHandler,
} from './assign-users.route';
import { getMyAssignments, getMyCompletions } from './my-assignments.route';
import { getCompletions, postCompletion } from './record-completion.route';
import { getModuleCompletions, postModuleComplete, postAdminComplete } from './completions.route';
import {
  getCertificates,
  postCertificate,
  getCertificate,
  patchCertificate,
  deleteCertificateHandler,
  postCertificateTemplate,
  deleteCertificateTemplateRoute,
} from './certificates.route';
import {
  getSupplements,
  postSupplement,
  getSupplement,
  updateSupplementHandler,
  deleteSupplementHandler,
} from './supplements.route';

// ---- Router ----

/** Training feature router - all routes require authentication. */
const router: Router = Router();

router.use(auth);

// ---- Modules ----
router.get('/modules', getModules);
router.post('/modules', postModules);

// ---- My views ----
router.get('/my-assignments', getMyAssignments);
router.get('/my-completions', getMyCompletions);

// ---- Admin completions ----
router.get('/completions', getCompletions);
router.post('/completions', postCompletion);

// ---- Module detail ----
router.get('/modules/:moduleId', getModule);
router.patch('/modules/:moduleId', updateModuleHandler);
router.delete('/modules/:moduleId', deleteModuleHandler);

// ---- Assignments (module-scoped) ----
router.get('/modules/:moduleId/assign', getAssignments);
router.post('/modules/:moduleId/assign', postAssign);
router.put('/modules/:moduleId/assign', putBulkAssign);
router.delete('/modules/:moduleId/assign', deleteAssignment);
router.patch('/modules/:moduleId/assign', patchBulkRemove);
router.get('/modules/:moduleId/assigned-users', getAssignedUsersHandler);

// ---- Completions (module-scoped) ----
router.get('/modules/:moduleId/complete', getModuleCompletions);
router.post('/modules/:moduleId/complete', postModuleComplete);
router.post('/modules/:moduleId/assignments/:userId/complete', postAdminComplete);

// ---- Certificates (module-scoped) ----
router.get('/modules/:moduleId/certificates', getCertificates);
router.post('/modules/:moduleId/certificates', postCertificate);
router.get('/modules/:moduleId/certificates/:certificateId', getCertificate);
router.patch('/modules/:moduleId/certificates/:certificateId', patchCertificate);
router.delete('/modules/:moduleId/certificates/:certificateId', deleteCertificateHandler);
router.post('/modules/:moduleId/certificate-template', postCertificateTemplate);
router.delete('/modules/:moduleId/certificate-template', deleteCertificateTemplateRoute);

// ---- Supplements (module-scoped) ----
router.get('/modules/:moduleId/supplements', getSupplements);
router.post('/modules/:moduleId/supplements', postSupplement);
router.get('/modules/:moduleId/supplements/:supplementId', getSupplement);
router.patch('/modules/:moduleId/supplements/:supplementId', updateSupplementHandler);
router.delete('/modules/:moduleId/supplements/:supplementId', deleteSupplementHandler);

export default router;
