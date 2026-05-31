const isProduction = process.env.NODE_ENV === 'production';

const sensitiveKeys = new Set([
  'password',
  'token',
  'jwt',
  'authorization',
  'secret',
  'cookie',
  'sig',
  'apikey',
  'api_key',
]);

const MAX_DEPTH = 10;

const shouldRedact = (key: string): boolean => {
  const normalized = key.toLowerCase().replace(/[-_\s]/g, '');
  return sensitiveKeys.has(normalized);
};

export const safeStringify = (obj: unknown): string => {
  const seen = new WeakSet<object>();

  const redacted = (value: unknown, depth = 0): unknown => {
    if (depth > MAX_DEPTH) {
      return '[Max Depth Reached]';
    }

    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: isProduction ? undefined : value.stack,
      };
    }

    if (value instanceof Map) {
      return Object.fromEntries(value);
    }

    if (value instanceof Set) {
      return [...value];
    }

    if (value && typeof value === 'object') {
      const objValue = value as object;

      if (seen.has(objValue)) {
        return '[Circular]';
      }

      seen.add(objValue);

      if (Array.isArray(value)) {
        return value.map((v) => redacted(v, depth + 1));
      }

      const result: Record<string, unknown> = {};

      for (const [k, v] of Object.entries(value)) {
        result[k] = shouldRedact(k) ? '[REDACTED]' : redacted(v, depth + 1);
      }

      return result;
    }

    return value;
  };

  try {
    return JSON.stringify(redacted(obj));
  } catch (err) {
    return `[Serialization Error: ${String(err)}]`;
  }
};
