// External libs
import { Router } from 'express';

// ---- Route handlers
import {
  patchNotificationStatusHandler,
  postLinkNotificationHandler,
  postRegisterPushTokenHandler,
} from './notification-actions.route';

// ---------------------------------------------------------------------------
// Notifications router
//
// Aggregates all notification-related route handlers under a single Express
// Router so it can be mounted at /api/notifications.
// ---------------------------------------------------------------------------

const router: Router = Router();

// ---- POST  /api/notifications/register                 — Register a push token

router.post('/register', postRegisterPushTokenHandler);

// ---- POST  /api/notifications/link                     — Link a push token to the current user

router.post('/link', postLinkNotificationHandler);

// ---- PATCH /api/notifications/:notificationId/status   — Update read / received status

router.patch('/:notificationId/status', patchNotificationStatusHandler);

export default router;
