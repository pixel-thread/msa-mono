import { z } from 'zod';

const stringToDateValidation = (val: string) => z.string(val).transform((val) => new Date(val));

export const CsvUserImportRowSchema = z.object({
  email: z.email('Invalid email'),
  firstName: z.string('First Name is Required').min(1, 'First name is required'),
  middleName: z.string('Middle name is required').default('').optional().nullable(),
  lastName: z.string('Last name is required').default('').optional().nullable(),
  mobile: z.string('Invalid mobile').regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  dob: stringToDateValidation('Invalid date of birth'),
  designation: z.string().default('').optional().nullable(),
  dateOfJoiningGovt: stringToDateValidation('Invalid date of joining Govt').optional().nullable(),
  dateOfJoiningAssociation: stringToDateValidation('Invalid date of joining Association')
    .optional()
    .nullable(),
  dateOfRetirement: stringToDateValidation('Invalid date of retirement').optional().nullable(),
});

export type CsvUserImportRowInput = z.infer<typeof CsvUserImportRowSchema>;
