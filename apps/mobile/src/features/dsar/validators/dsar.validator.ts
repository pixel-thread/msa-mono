import { z } from 'zod';

export const dsarSubmitSchema = z.object({
  requestType: z.enum(['ACCESS', 'CORRECTION', 'DELETION', 'PORTABILITY']),
  requestedData: z.array(z.string()).min(1, 'At least one data category is required'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

export type DSARSubmitFormData = z.infer<typeof dsarSubmitSchema>;

export const dsarResponseSchema = z
  .object({
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'REJECTED']),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
    responseType: z.string().optional(),
    storageKey: z.string().optional(),
    rejectedReason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'REJECTED' && !data.rejectedReason) {
        return false;
      }
      return true;
    },
    {
      message: 'Rejected reason is required when status is REJECTED',
      path: ['rejectedReason'],
    }
  );

export type DSARResponseFormData = z.infer<typeof dsarResponseSchema>;
