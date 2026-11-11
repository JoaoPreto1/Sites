import { z } from 'zod';
import { checkOutAfterCheckIn, datesMessage, stayDates } from './common.js';

export const stayInput = z
  .object({
    propertyId: z.string().min(1),
    ...stayDates,
    adults: z.coerce.number().int().min(1).max(16),
    children: z.coerce.number().int().min(0).max(10).default(0),
    extras: z
      .array(
        z.object({
          experienceId: z.string().min(1),
          people: z.coerce.number().int().min(1).max(16),
        }),
      )
      .max(10)
      .default([]),
  })
  .refine(checkOutAfterCheckIn, datesMessage);
