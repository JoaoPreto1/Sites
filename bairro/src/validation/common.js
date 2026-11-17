import { body, param, query } from 'express-validator';

const DATE_FORMAT = { format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] };

export const isoDate = (field, location = body, message = 'Data inválida') => location(field, message).isDate(DATE_FORMAT);

export const email = (field = 'email') => body(field, 'Escreva um email válido').trim().isEmail();

export const text = (field, { min = 1, max, message } = {}) =>
  body(field, message ?? `Entre ${min} e ${max} caracteres`).isString().trim().isLength({ min, max });

export const optionalText = (field, max) => body(field).optional().isString().trim().isLength({ max });

export const password = (field) =>
  body(field, 'A palavra-passe precisa de pelo menos 8 caracteres').isString().isLength({ min: 8, max: 100 });

// Lista de valores possíveis: aceita um array em que cada elemento pertence à lista
export const listOf = (field, allowed, { min = 0, message } = {}) => [
  body(field, message ?? 'Escolha pelo menos uma opção')
    .default([])
    .isArray({ min, max: allowed.length }),
  body(`${field}.*`, 'Opção inválida').isIn(allowed),
];

// Fotografias do Unsplash identificadas só pelo código (ex.: 1612599316791-451087c7fe15)
export const photoId = (field) => body(field, 'Código de fotografia inválido').trim().matches(/^\d{9,13}-[0-9a-f]{12}$/);

export const id = (field = 'id') => param(field).isString().isLength({ min: 1, max: 80 });

export { body, param, query };
