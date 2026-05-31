import { ContextStore } from '@src/shared/lib/tracing/context';

describe('ContextStore', () => {
  it('should run a callback within a context and retrieve values', () => {
    const context = { requestId: 'req-1', userId: 'user-1' };

    ContextStore.run(context, () => {
      expect(ContextStore.get()).toEqual(context);
      expect(ContextStore.getByKey('requestId')).toBe('req-1');
      expect(ContextStore.getByKey('userId')).toBe('user-1');
      expect(ContextStore.getByKey('associationId')).toBeUndefined();
    });
  });

  it('should support updating context values', () => {
    const context = { requestId: 'req-1' };

    ContextStore.run(context, () => {
      ContextStore.set('userId', 'user-2');
      expect(ContextStore.getByKey('userId')).toBe('user-2');
      expect(ContextStore.get()?.userId).toBe('user-2');
    });
  });

  it('should throw an error when calling set outside of context', () => {
    expect(() => ContextStore.set('userId', '123')).toThrow(
      'No async context found. Ensure the execution is wrapped in a ContextStore.run() call.',
    );
  });

  it('should maintain isolation between parallel contexts', async () => {
    const context1 = { requestId: 'req-1' };
    const context2 = { requestId: 'req-2' };

    const p1 = ContextStore.run(context1, async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(ContextStore.getByKey('requestId')).toBe('req-1');
    });

    const p2 = ContextStore.run(context2, async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      expect(ContextStore.getByKey('requestId')).toBe('req-2');
    });

    await Promise.all([p1, p2]);
  });
});
