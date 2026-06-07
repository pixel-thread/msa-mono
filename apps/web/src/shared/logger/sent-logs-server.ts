import { Writable } from 'stream';

import http from '../utils/http';

const PINO_LEVELS: Record<number, string> = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};

export function sentLogsToServer() {
  return new Writable({
    objectMode: true,

    async write(chunk, _encoding, callback) {
      try {
        const raw =
          typeof chunk === 'string'
            ? chunk
            : Buffer.isBuffer(chunk)
              ? chunk.toString()
              : JSON.stringify(chunk);

        const parsed = JSON.parse(raw);
        const { level, msg, ...rest } = parsed;

        await http.post('/logs/batch', {
          logs: [
            {
              type: PINO_LEVELS[level as number] ?? 'info',
              message: typeof msg === 'string' ? msg : JSON.stringify(msg),
              content: rest as object,
              isBackend: true,
            },
          ],
        });

        callback();
      } catch (error) {
        console.error('Postgres log transport error:', error);
        callback();
      }
    },
  });
}
