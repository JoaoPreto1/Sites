import { body } from 'express-validator';

const DATE_FORMAT = { format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] };

export const isoDate = (field, location = body, message = 'Data inválida') => location(field, message).isDate(DATE_FORMAT);

// A data de saída tem de ser depois da entrada (quando as duas existem)
export const checkOutAfterCheckIn = (location = body) =>
  location('checkOut', 'A data de saída tem de ser depois da entrada').custom(
    (checkOut, { req, location: where }) => !req[where].checkIn || checkOut > req[where].checkIn,
  );

export const email = (field = 'email') => body(field, 'Escreva um email válido').trim().isEmail();

export const text = (field, { min = 1, max, message } = {}) =>
  body(field, message ?? `Entre ${min} e ${max} caracteres`).isString().trim().isLength({ min, max });
