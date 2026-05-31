import { z } from 'zod';
import { REGEX } from '../constants';

export const passwordValidation = z
  .string('Password must be at least 8 characters')
  .min(8, 'Password must be at least 8 characters')
  .regex(REGEX.PASSWORD_UPPER, 'Password must contain at least one uppercase letter')
  .regex(REGEX.PASSWORD_LOWER, 'Password must contain at least one lowercase letter')
  .regex(REGEX.PASSWORD_DIGIT, 'Password must contain at least one number')
  .regex(REGEX.PASSWORD_SPECIAL, 'Password must contain at least one special character');
