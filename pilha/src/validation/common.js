import { body, param, query } from 'express-validator';

export const email = (field = 'email') => body(field, 'Escreva um email válido').trim().isEmail().isLength({ max: 120 });

export const text = (field, { min = 1, max, message } = {}) =>
  body(field, message ?? `Entre ${min} e ${max} caracteres`).isString().trim().isLength({ min, max });

export const optionalText = (field, max, message) =>
  body(field, message ?? `No máximo ${max} caracteres`).optional({ values: 'falsy' }).isString().trim().isLength({ max });

export const password = (field) =>
  body(field, 'A palavra-passe precisa de pelo menos 10 caracteres').isString().isLength({ min: 10, max: 128 });

export const oneOf = (field, values, message) => body(field, message).isIn(values);

export const flag = (field) => body(field).optional().isBoolean().toBoolean();

export const id = (field = 'id') => param(field, 'Identificador inválido').isString().isLength({ min: 1, max: 80 });

export const isoDay = (field, message = 'Escolha uma data válida') =>
  body(field, message).optional({ values: 'falsy' }).isISO8601({ strict: true }).isLength({ max: 10 });

export { body, param, query };
