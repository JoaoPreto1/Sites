import { Router } from 'express';
import { query } from 'express-validator';
import * as controller from '../controllers/properties.controller.js';
import { validate } from '../middleware/validate.js';
import { checkOutAfterCheckIn, isoDate } from '../validation/common.js';
import { nightsBetween } from '../utils/dates.js';

const listQuery = [
  isoDate('checkIn', query).optional(),
  isoDate('checkOut', query).optional(),
  checkOutAfterCheckIn(query).optional(),
  query('guests', 'Entre 1 e 16 hóspedes').optional().isInt({ min: 1, max: 16 }).toInt(),
  query('tag', 'Filtro inválido').optional().isIn(['vista-mar', 'piscina', 'familias', 'casais']),
];

const calendarQuery = [
  isoDate('from', query),
  isoDate('to', query)
    .custom((to, { req }) => to > req.query.from && nightsBetween(req.query.from, to) <= 400)
    .withMessage('Intervalo inválido (máximo 400 dias)'),
];

const router = Router();

router.get('/', validate(listQuery, 'query'), controller.list);
router.get('/:slug', controller.show);
router.get('/:slug/calendar', validate(calendarQuery, 'query'), controller.calendar);

export default router;
