import { Router } from 'express';
import { z } from 'zod';
import * as controller from '../controllers/properties.controller.js';
import { validate } from '../middleware/validate.js';
import { checkOutAfterCheckIn, datesMessage, isoDate } from '../validation/common.js';
import { nightsBetween } from '../utils/dates.js';

const listQuery = z
  .object({
    checkIn: isoDate.optional(),
    checkOut: isoDate.optional(),
    guests: z.coerce.number().int().min(1).max(16).optional(),
    tag: z.enum(['vista-mar', 'piscina', 'familias', 'casais']).optional(),
  })
  .refine(checkOutAfterCheckIn, datesMessage);

const calendarQuery = z
  .object({ from: isoDate, to: isoDate })
  .refine((q) => q.to > q.from && nightsBetween(q.from, q.to) <= 400, {
    message: 'Intervalo inválido (máximo 400 dias)',
    path: ['to'],
  });

const router = Router();

router.get('/', validate(listQuery, 'query'), controller.list);
router.get('/:slug', controller.show);
router.get('/:slug/calendar', validate(calendarQuery, 'query'), controller.calendar);

export default router;
