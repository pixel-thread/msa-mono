import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Request-scoped context type
 */
export type Context = {
  /** Unique ID for tracing the request across the system */
  requestId: string;
  /** Authenticated user ID, if available */
  userId?: string;
  /** Association ID for multi-tenant scoping, if available */
  associationId?: string;
  role: string[];
};

const asyncLocalStorage = new AsyncLocalStorage<Context>();

/**
 * ContextStore provides methods to interact with AsyncLocalStorage
 * for request-scoped data.
 */
export const ContextStore = {
  /**
   * Runs the callback within a new context
   */
  run<T>(context: Context, callback: () => T): T {
    return asyncLocalStorage.run(context, callback);
  },

  /**
   * Retrieves the current context store
   */
  get(): Context | undefined {
    return asyncLocalStorage.getStore();
  },

  /**
   * Sets a value in the current context store
   * @throws Error if called outside of an active context
   */
  set<K extends keyof Context>(key: K, value: Context[K]): void {
    const store = asyncLocalStorage.getStore();
    if (!store) {
      throw new Error(
        'No async context found. Ensure the execution is wrapped in a ContextStore.run() call.',
      );
    }
    store[key] = value;
  },

  /**
   * Helper to get a specific value from the context
   */
  getByKey<K extends keyof Context>(key: K): Context[K] | undefined {
    return asyncLocalStorage.getStore()?.[key];
  },
};
