import { body, param, query } from 'express-validator';

export const email = (field = 'email') => body(field, 'Escreva um email válido').trim().isEmail().isLength({ max: 120 });

export const text = (field, { min = 1, max, message } = {}) =>
  body(field, message ?? `Entre ${min} e ${max} caracteres`).isString().trim().isLength({ min, max });

export const optionalText = (field, max) => body(field).optional({ values: 'falsy' }).isString().trim().isLength({ max });

export const password = (field) =>
  body(field, 'A palavra-passe precisa de pelo menos 10 caracteres').isString().isLength({ min: 10, max: 128 });

// Montante em euros (aceita "12,50" ou 12.5) convertido para cêntimos inteiros
export const amount = (field, minCents, maxCents, message) =>
  body(field, message)
    .customSanitizer((v) => Math.round(Number(String(v).replace(/\s/g, '').replace(',', '.')) * 100))
    .isInt({ min: minCents, max: maxCents })
    .toInt();

export const flag = (field) => body(field).optional().isBoolean().toBoolean();

export const id = (field = 'id') => param(field, 'Identificador inválido').isString().isLength({ min: 1, max: 80 });

export { body, param, query };
