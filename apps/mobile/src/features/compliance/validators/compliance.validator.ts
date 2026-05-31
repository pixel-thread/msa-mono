import { z } from 'zod';

export const complianceSubmitSchema = z.object({
  category: z.enum([
    'MEETING_CONDUCT',
    'PAYMENT_DISPUTE',
    'DATA_PRIVACY',
    'MEMBER_CONDUCT',
    'ADMINISTRATIVE',
    'OTHER',
  ]),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject cannot exceed 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description cannot exceed 2000 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

export type ComplianceSubmitFormData = z.output<typeof complianceSubmitSchema>;
