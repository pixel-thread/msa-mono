import z from 'zod';

const associationsSlug = ['mfsa', 'mpsa', 'mpsc'];

/**
 * Zod schema for membership applications.
 * Validates personal details, association selection, and age requirements.
 */
export const MembershipApplicationSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    associationSlug: z.enum(associationsSlug as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid association' }),
    }),
    firstName: z.string().min(3, 'First name must be at least 3 characters'),
    lastName: z.string().min(3, 'Last name must be at least 3 characters'),
    dateOfBirth: z.coerce.date().transform((val) => new Date(val)),
    age: z
      .number({ invalid_type_error: 'Age must be a number' })
      .positive('Age must be a positive number')
      .gte(18, 'Age must be greater than 18'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
      errorMap: () => ({ message: 'Invalid gender' }),
    }),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  })
  .refine(
    (data) => {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
      return age >= 18;
    },
    {
      message: 'You must be at least 18 years old to sign up.',
      path: ['dateOfBirth'],
    },
  )
  .strict();

/**
 * Type definition for membership application input data.
 * Inferred from MembershipApplicationSchema.
 */
export type MembershipApplicationInput = z.infer<typeof MembershipApplicationSchema>;
