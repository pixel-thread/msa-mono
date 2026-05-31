import { useContext } from 'react';
import { NotificationContext } from '@lib/context/notifications';

/**
 * Provides access to the notification context for managing in-app notifications.
 *
 * Returns the NotificationContext value which contains state and functions for
 * handling notifications. Must be used within a NotificationProvider component.
 *
 * @returns NotificationContext value containing notification state and methods
 * @returns {Notification[]} notifications - Array of current notifications
 * @returns {Function} addNotification - Function to add a new notification
 * @returns {Function} removeNotification - Function to remove a notification by ID
 * @returns {Function} clearAll - Function to clear all notifications
 *
 * @throws {Error} When used outside of NotificationProvider
 *
 * @example
 * ```typescript
 * const { notifications, addNotification, removeNotification, clearAll } = useNotifications();
 *
 * // Add a new notification:
 * addNotification({
 *   id: '1',
 *   type: 'success',
 *   title: 'Meeting Created',
 *   message: 'Your meeting has been scheduled successfully.',
 *   duration: 5000
 * });
 *
 * // Display notifications:
 * return (
 *   <View>
 *     {notifications.map((notification) => (
 *       <NotificationToast
 *         key={notification.id}
 *         notification={notification}
 *         onDismiss={() => removeNotification(notification.id)}
 *       />
 *     ))}
 *   </View>
 * );
 * ```
 *
 * @example
 * // Clear all notifications on unmount:
 * useEffect(() => {
 *   return () => clearAll();
 * }, []);
 *
 * @see {@link NotificationProvider} For the provider component that wraps this hook
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

