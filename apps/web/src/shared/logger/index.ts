'use client';
import pino from 'pino';
import { env } from '@src/env';
import { sentLogsToServer } from './sent-logs-server';

const isProduction = env.NEXT_PUBLIC_NODE_ENV === 'production';

const REDACTED = [
  'password',
  'secret',
  'token',
  'authorization',
  'key',
  'refreshToken',
  'access_token',
];

const streams: pino.StreamEntry[] = [
  {
    stream: sentLogsToServer(),
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
