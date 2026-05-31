import * as SecureStore from 'expo-secure-store';
interface RateLimitConfig {
  limit: number; // Max number of requests
  windowMs: number; // Time frame in milliseconds
}

/**
 * Checks if an action should be rate limited.
 * Returns { limited: boolean, retryAfter?: number }
 */
export const checkRateLimit = async (
  key: string,
  config: RateLimitConfig
): Promise<{ limited: boolean; retryAfter?: number }> => {
  const STORAGE_KEY = `rl_${key}`;
  const now = Date.now();

  try {
    const storedData = SecureStore.getItem(STORAGE_KEY);
    let timestamps: number[] = storedData ? JSON.parse(storedData) : [];

    // 1. Remove timestamps outside the current window
    const windowStart = now - config.windowMs;
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // 2. Check if limit is reached
    if (timestamps.length >= config.limit) {
      const oldestValidTimestamp = timestamps[0];
      const retryAfter = Math.ceil((oldestValidTimestamp + config.windowMs - now) / 1000);

      return { limited: true, retryAfter };
    }

    // 3. Log the new timestamp and save
    timestamps.push(now);
    SecureStore.setItem(STORAGE_KEY, JSON.stringify(timestamps));

    return { limited: false };
  } catch (error) {
    // If storage fails, fail-safe by allowing the request
    console.error('Rate limiter storage error:', error);
    return { limited: false };
  }
};
