import { body } from 'express-validator';

const DATE_FORMAT = { format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] };

export const isoDate = (field, location = body, message = 'Data inválida') => location(field, message).isDate(DATE_FORMAT);

export const email = (field = 'email') => body(field, 'Escreva um email válido').trim().isEmail();

export const text = (field, { min = 1, max, message } = {}) =>
  body(field, message ?? `Entre ${min} e ${max} caracteres`).isString().trim().isLength({ min, max });

export const optionalText = (field, max) => body(field).optional().isString().trim().isLength({ max });

export const password = (field) =>
  body(field, 'A palavra-passe precisa de pelo menos 8 caracteres').isString().isLength({ min: 8, max: 100 });
