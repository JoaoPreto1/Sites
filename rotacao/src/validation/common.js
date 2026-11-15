import { body, param, query } from 'express-validator';
import { GRADES } from '../data/records.js';

const DATE_FORMAT = { format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] };

export const isoDate = (field, location = body, message = 'Data inválida') => location(field, message).isDate(DATE_FORMAT);

export const email = (field = 'email') => body(field, 'Escreve um email válido').trim().isEmail();

export const text = (field, { min = 1, max, message } = {}) =>
  body(field, message ?? `Entre ${min} e ${max} caracteres`).isString().trim().isLength({ min, max });

export const optionalText = (field, max) => body(field).optional().isString().trim().isLength({ max });

export const password = (field) =>
  body(field, 'A palavra-passe precisa de pelo menos 8 caracteres').isString().isLength({ min: 8, max: 100 });

export const postalCode = (field = 'postalCode') => body(field, 'Código postal no formato 0000-000').trim().matches(/^\d{4}-\d{3}$/);

export const grade = (field, location = body) => location(field, 'Estado inválido').isIn(GRADES.map((g) => g.code));

export const id = (field = 'id') => param(field).isString().isLength({ min: 1, max: 80 });

export { body, param, query };
