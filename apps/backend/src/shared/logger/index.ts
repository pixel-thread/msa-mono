import { env } from '@src/env';
import pino from 'pino';

import { createPostgresTransport } from './postgres-transport';

const isProduction = env.NODE_ENV === 'production';

const REDACTED = [
  'password',
  'username',
  'host',
  'port',
  'secret',
  'token',
  'authorization',
  'key',
  'refersh_token',
  'access_token',
  'data',
  "data['token']",
  "data['refreshToken']",
];

const streams: pino.StreamEntry[] = [
  {
    stream: createPostgresTransport(),
    level: 'trace',
  },
];

//
// only log to console in development
//
if (!isProduction) {
  streams.push({
    stream: process.stdout,
    level: 'debug',
  });
}

/** Application-wide Pino logger instance with Postgres transport and console output in dev. */
export const logger = pino(
  {
    level: 'trace',
    redact: REDACTED,
  },
  pino.multistream(streams),
);
