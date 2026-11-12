import { body } from 'express-validator';
import { ageOn } from '../utils/dates.js';

const DATE_FORMAT = { format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] };

export const isoDate = (field, location = body, message = 'Data inválida') => location(field, message).isDate(DATE_FORMAT);

export const email = (field = 'email') => body(field, 'Escreva um email válido').trim().isEmail();

export const text = (field, { min = 1, max, message } = {}) =>
  body(field, message ?? `Entre ${min} e ${max} caracteres`).isString().trim().isLength({ min, max });

export const optionalText = (field, max) => body(field).optional().isString().trim().isLength({ max });

export const password = (field) =>
  body(field, 'A palavra-passe precisa de pelo menos 8 caracteres').isString().isLength({ min: 8, max: 100 });

export const adult = (field = 'birthDate') =>
  isoDate(field, body, 'Indique a data de nascimento')
    .bail()
    .custom((value) => ageOn(value) >= 18)
    .withMessage('Só vendemos vinho a maiores de 18 anos')
    .custom((value) => ageOn(value) < 120)
    .withMessage('Data de nascimento inválida');

export const postalCode = (field = 'postalCode') => body(field, 'Código postal no formato 0000-000').trim().matches(/^\d{4}-\d{3}$/);
