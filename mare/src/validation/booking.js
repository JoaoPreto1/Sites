import { z } from 'zod';
import { checkOutAfterCheckIn, datesMessage, stayDates } from './common.js';

const extra = z.object({
  experienceId: z.string().min(1),
  people: z.coerce.number().int().min(1).max(16),
});

const stayFields = {
  propertyId: z.string().min(1),
  ...stayDates,
  adults: z.coerce.number().int().min(1).max(16),
  children: z.coerce.number().int().min(0).max(10).default(0),
  extras: z.array(extra).max(10).default([]),
};

export const stayInput = z.object(stayFields).refine(checkOutAfterCheckIn, datesMessage);

export const bookingInput = z
  .object({
    ...stayFields,
    guest: z.object({
      name: z.string().trim().min(2, 'Escreva o nome de quem fica na casa').max(80),
      phone: z.string().trim().min(6, 'Precisamos de um telemóvel para combinar a chegada').max(30),
    }),
    notes: z.string().trim().max(1000).optional(),
    acceptTerms: z.literal(true, { error: 'Tem de aceitar as condições da reserva' }),
  })
  .refine(checkOutAfterCheckIn, datesMessage);

export const checkinInput = z.object({
  arrivalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Indique a hora no formato 16:30'),
  phone: z.string().trim().min(6).max(30),
  guestNames: z.string().trim().min(2, 'Indique o nome dos hóspedes').max(1000),
  notes: z.string().trim().max(1000).optional(),
});

export const extraInput = extra;
