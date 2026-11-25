import { body, query } from 'express-validator';
import { isIsoDay } from '../utils/dates.js';
import { ROOM_NUMS } from '../config/site.js';

const day = (fn, field, label) => fn(field, `Escolha a data de ${label}`).isString().custom(isIsoDay);

// Datas no endereço (?chegada=…&saida=…&hospedes=…): todas opcionais, por omissão o próximo fim de semana
export const stayQuery = [
  day(query, 'chegada', 'chegada').optional(),
  day(query, 'saida', 'saída').optional(),
  query('hospedes', 'Entre 1 e 3 hóspedes').optional().isInt({ min: 1, max: 3 }).toInt(),
];
export const toStay = (q = {}) => ({ checkIn: q.chegada, checkOut: q.saida, guests: q.hospedes });

export const stayBody = [
  body('room', 'Escolha um quarto').isIn(ROOM_NUMS),
  day(body, 'checkIn', 'chegada'),
  day(body, 'checkOut', 'saída'),
  body('guests', 'Entre 1 e 3 hóspedes').isInt({ min: 1, max: 3 }).toInt(),
];

export const arrivalTime = () => body('arrivalTime', 'Escolha uma hora entre as 15h e as 23h').optional({ values: 'falsy' }).matches(/^(1[5-9]|2[0-3]):[0-5]\d$/);
export const notes = () => body('notes', 'No máximo 500 caracteres').optional({ values: 'falsy' }).isString().trim().isLength({ max: 500 });
export { day };
