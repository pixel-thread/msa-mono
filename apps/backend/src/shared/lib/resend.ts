import { env } from '@src/env';
import { Resend } from 'resend';

/** Singleton Resend email client initialized from environment config. */
export const resend = new Resend(env.RESEND_API_KEY);
