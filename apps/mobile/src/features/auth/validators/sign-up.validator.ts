import { z } from 'zod';

export const SignUpSchema = z
  .object({
    associationSlug: z
      .string({ message: 'Association slug is required' })
      .min(1, 'Association slug is required')
      .regex(
        /^[a-z0-9-]+$/,
        'Association slug can only contain lowercase letters, numbers, and hyphens'
      ),
    firstName: z
      .string({ message: 'First name must be at least 3 characters' })
      .min(3, 'First name must be at least 3 characters'),
    lastName: z
      .string({ message: 'Last name must be at least 3 characters' })
      .min(3, 'Last name must be at least 3 characters'),
    email: z.email('Please enter a valid email address'),
    phone: z.coerce.number({ message: 'Phone must be a number' }),
    dobDay: z.coerce
      .number({ message: 'Day must be a number' })
      .int('Day must be a whole number')
      .min(1, 'Day must be between 1 and 31')
      .max(31, 'Day must be between 1 and 31'),
    dobMonth: z.coerce
      .number({ message: 'Month must be a number' })
      .int('Month must be a whole number')
      .min(1, 'Month must be between 1 and 12')
      .max(12, 'Month must be between 1 and 12'),
    dobYear: z.coerce
      .number({ message: 'Year must be a number' })
      .int('Year must be a whole number')
      .min(1900, 'Year must be 1900 or later')
      .max(new Date().getFullYear(), 'Year cannot be in the future'),
    age: z.coerce
      .number({ message: 'Age must be a number' })
      .int('Age must be a whole number')
      .positive('Age must be a positive number')
      .gte(18, 'You must be at least 18 years old'),
    gender: z.enum(['male', 'female', 'other'], {
      message: 'Please select male, female, or other',
    }),
    address: z
      .string({ message: 'Address must be at least 3 characters' })
      .min(3, 'Address must be at least 3 characters'),
    city: z
      .string({ message: 'City must be at least 3 characters' })
      .min(3, 'City must be at least 3 characters'),
    state: z
      .string({ message: 'State must be at least 3 characters' })
      .min(3, 'State must be at least 3 characters'),
    country: z
      .string({ message: 'Country must be at least 3 characters' })
      .min(3, 'Country must be at least 3 characters'),
    postalCode: z
      .string({ message: 'Postal code must be at least 3 characters' })
      .min(3, 'Postal code must be at least 3 characters')
      .regex(/^\d+$/, 'Postal code must contain only numbers'),
  })
  .refine((data) => data.age >= 18, { message: 'You must be at least 18 years old' })
  .refine((data) => data.age <= 120, { message: 'You must be less than 120 years old' })
  .refine((data) => data.age % 1 === 0, { message: 'Age must be an integer' })
  .refine((data) => data.age !== 0, { message: 'Age must be greater than 0' })
  .refine((data) => data.firstName !== data.lastName, {
    message: 'First name and last name cannot be the same',
    path: ['lastName'],
  })
  .transform(({ dobDay, dobMonth, dobYear, ...rest }) => {
    const day = String(dobDay).padStart(2, '0');
    const month = String(dobMonth).padStart(2, '0');
    const year = String(dobYear);
    return {
      ...rest,
      dateOfBirth: `${day}-${month}-${year}`,
    };
  });

export type SignUpFormData = z.infer<typeof SignUpSchema>;
