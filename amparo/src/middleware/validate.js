import { matchedData, validationResult } from 'express-validator';
import { HttpError } from '../utils/httpError.js';

// Corre as regras do express-validator e, se alguma falhar, responde 400 com a lista de campos.
// Os dados validados (e só esses) ficam em req.valid.body ou req.valid.query.
export const validate = (rules, location = 'body') => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const details = result.array({ onlyFirstError: true }).map((error) => ({
        field: error.path,
        message: error.msg,
      }));
      return next(new HttpError(400, 'Há campos por corrigir', details));
    }

    req.valid = { ...req.valid, [location]: matchedData(req, { locations: [location] }) };
    next();
  },
];
