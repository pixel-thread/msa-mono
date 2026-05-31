import { useState, useCallback, useEffect, useRef } from 'react';
import { checkRateLimit } from '@utils/rate-limiting';
import { toast } from 'sonner-native';
import { IRateLimitOptions } from '@sharedTypes/rate-limiting';

const defaultOptions: IRateLimitOptions = {
  limit: 1,
  windowMs: 60000,
  message: 'Rate limit reached',
};

export const useRateLimit = (key: string, options: IRateLimitOptions = defaultOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  /**
   * Instant client-side lock (prevents double click race)
   */
  const lockedRef = useRef(false);

  /**
   * Prevents duplicate clicks inside window instantly
   */
  const lastClickRef = useRef(0);

  /**
   * Countdown timer
   */
  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) return;

    const interval = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAfter]);

  const executeWithLimit = useCallback(
    async (action: () => Promise<void> | void) => {
      const now = Date.now();

      /**
       * 🔥 HARD CLIENT GUARD (fixes "needs 2 clicks")
       */
      if (lockedRef.current || isProcessing) return;

      /**
       * 🔥 instant debounce (fixes rapid double click)
       */
      if (now - lastClickRef.current < 300) return;

      lastClickRef.current = now;
      lockedRef.current = true;
      setIsProcessing(true);

      try {
        const status = await checkRateLimit(key, {
          limit: options.limit,
          windowMs: options.windowMs,
        });

        if (status.limited) {
          const seconds = status.retryAfter ?? Math.ceil(options.windowMs / 1000);

          setRetryAfter(seconds);

          toast.warning(options.message ?? 'Rate limit reached', {
            description: `Please wait ${seconds}s before trying again.`,
            dismissible: false,
          });

          return;
        }

        /**
         * success → clear cooldown
         */
        setRetryAfter(null);

        await action();
      } finally {
        setIsProcessing(false);

        /**
         * unlock safely after render cycle
         */
        lockedRef.current = false;
      }
    },
    [key, options, isProcessing]
  );

  return {
    executeWithLimit,

    /**
     * UI states
     */
    isProcessing,
    retryAfter,

    /**
     * true while cooldown active
     */
    isLimited: retryAfter !== null && retryAfter > 0,
  };
};
