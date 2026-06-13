import { z } from 'zod';

export const CsvUserImportRowSchema = z.object({
  email: z.email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  dob: z.coerce.date(),
  designation: z.string().default('').optional().nullable(),
  dateOfJoiningGovt: z.string().default('').optional(),
  dateOfJoiningAssociation: z.string().default('').optional().nullable(),
  dateOfRetirement: z.string().default('').optional().nullable(),
});

export type CsvUserImportRowInput = z.infer<typeof CsvUserImportRowSchema>;
