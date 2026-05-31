/**
 * Represents a pending request in the queue while a token refresh is in progress.
 */
export interface QueueItem {
  /** Function to resolve the promise with a new token */
  resolve: (token: string) => void;
  /** Function to reject the promise with an error */
  reject: (error: unknown) => void;
}
