import { body } from 'express-validator';
import { checkOutAfterCheckIn, isoDate, text } from './common.js';

const extraRules = (prefix = '') => [
  body(`${prefix}experienceId`, 'Experiência inválida').isString().notEmpty(),
  body(`${prefix}people`, 'Entre 1 e 16 pessoas').isInt({ min: 1, max: 16 }).toInt(),
];

const stayRules = [
  body('propertyId', 'Indique o alojamento').isString().notEmpty(),
  isoDate('checkIn'),
  isoDate('checkOut'),
  checkOutAfterCheckIn(),
  body('adults', 'Entre 1 e 16 adultos').isInt({ min: 1, max: 16 }).toInt(),
  body('children', 'Entre 0 e 10 crianças').default(0).isInt({ min: 0, max: 10 }).toInt(),
  body('extras', 'No máximo 10 experiências').default([]).isArray({ max: 10 }),
  ...extraRules('extras.*.'),
];

export const stayInput = stayRules;

export const bookingInput = [
  ...stayRules,
  text('guest.name', { min: 2, max: 80, message: 'Escreva o nome de quem fica na casa' }),
  text('guest.phone', { min: 6, max: 30, message: 'Precisamos de um telemóvel para combinar a chegada' }),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
  body('acceptTerms', 'Tem de aceitar as condições da reserva').custom((value) => value === true),
];

export const checkinInput = [
  body('arrivalTime', 'Indique a hora no formato 16:30').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  text('phone', { min: 6, max: 30, message: 'Indique um telemóvel válido' }),
  text('guestNames', { min: 2, max: 1000, message: 'Indique o nome dos hóspedes' }),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
];

export const extraInput = extraRules();
