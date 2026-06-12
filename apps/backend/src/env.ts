import { z } from 'zod';

import 'dotenv/config';

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number('invalid port number').default(4000),
  PUBLIC_STORAGE_URL: z.string('PUBLIC_BASE_URL'),
  BASE_URL: z.url('BASE_URL'),
  //
  //
  // Database
  DATABASE_URL: z.url('DATABASE_URL'),
  //
  //
  // Redis
  UPSTASH_REDIS_REST_URL: z.url('UPSTASH_REDIS_REST_URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string('UPSTASH_REDIS_REST_TOKEN').min(1),
  // Storage
  STORAGE_PROVIDER: z.enum(['sftp', 'supabase']).default('sftp'),
  STORAGE_BUCKET: z.string('Invalid bucket name').default('public'),

  // Supabase
  SUPABASE_SECRET_KEY: z.string('SUPABASE_SECRET_KEY'),
  SUPABASE_URL: z.url('SUPABASE_URL'),

  // SFTP
  SFTP_HOST: z.string('SFTP_HOST'),
  SFTP_USERNAME: z.string('SFTP_USERNAME').default('sftp_user'),
  SFTP_PASSWORD: z.string('SFTP_PASSWORD'),
  SFTP_PORT: z.coerce.number('SFTP_PORT').default(22),
  SFTP_TIMEOUT: z.coerce.number('SFTP_TIMEOUT').default(30000),
  SFTP_ROOT: z.string('SFTP_ROOT').default('/'),

  // Crypto
  FIELD_ENCRYPTION_KEY: z.string('FIELD_ENCRYPTION_KEY').min(32),

  // Cron
  CRON_SECRET: z.string('CRON_SECRET').min(1),

  // Email
  RESEND_API_KEY: z.string('RESEND_API_KEY').optional(),

  // Razorpay
  RAZORPAY_KEY_ID: z.string('RAZORPAY_KEY_ID').min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string('RAZORPAY_KEY_SECRET').min(1).optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string('RAZORPAY_WEBHOOK_SECRET').min(1).optional(),

  // EAS Webhook
  EAS_WEBHOOK_SECRET: z.string('EAS_WEBHOOK_SECRET').min(16),

  // JWT
  JWT_SECRET: z.string('JWT_SECRET').min(32),
  JWT_REFRESH_SECRET: z.string('JWT_REFRESH_SECRET').min(32),
  JWT_PASSWORD_RESET_SECRET: z.string('JWT_PASSWORD_RESET_SECRET').min(32),
  JWT_ISSUER: z.string('JWT_ISSUER').default('http://localhost:4000'),
  JWT_AUDIENCE: z.string('JWT_AUDIENCE').default('http://localhost:4000'),
  ACCESS_TOKEN_EXPIRY: z.string('ACCESS_TOKEN_EXPIRY').default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string('REFRESH_TOKEN_EXPIRY').default('7d'),

  // OTP
  OTP_EXPIRY: z.string('OTP_EXPIRY').default('5m'),
  OTP_LENGTH: z.coerce.number('OTP_LENGTH').default(6),
  OTP_MAX_ATTEMPTS: z.coerce.number('OTP_MAX_ATTEMPTS').default(3),
  OTP_RESEND_COOLDOWN: z.coerce.number('OTP_RESEND_COOLDOWN').default(60),

  // Password Reset
  PASSWORD_RESET_TOKEN_EXPIRY: z.string('PASSWORD_RESET_TOKEN_EXPIRY').default('1h'),
  NEXT_PUBLIC_ASSOCIATION_SLUG: z
    .string('NEXT_PUBLIC_ASSOCIATION_SLUG')
    .min(2)
    .max(10)
    .default('mfsa'),
  NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error);
  process.exit(1);
}

export const env = parsed.data;
