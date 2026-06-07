// ---- External libs ----
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Notification validators
//
// Feature-level Zod schemas for notification route handlers.
// Shared notification schemas (UpdateNotificationSchema, NotificationRouteParams)
// live in @validator/notification.
// ---------------------------------------------------------------------------

/** Schema for registering a push notification token (no user link). */
export const NotificationRegisterPushTokenSchema = z.object({
  token: z.string(),
});

/** Schema for linking an existing push token to a user. */
export const NotificationLinkTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type NotificationRegisterPushTokenInput = z.infer<typeof NotificationRegisterPushTokenSchema>;
export type NotificationLinkTokenInput = z.infer<typeof NotificationLinkTokenSchema>;
