import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
  requestId: string;
  userId?: string;
};

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const ContextStore = {
  run<T>(context: RequestContext, callback: () => T) {
    return asyncLocalStorage.run(context, callback);
  },
  get() {
    return asyncLocalStorage.getStore();
  },
  set<K extends keyof RequestContext>(key: K, value: RequestContext[K]) {
    const store = asyncLocalStorage.getStore();
    if (!store) throw new Error('No async context found');
    store[key] = value;
  },
};
