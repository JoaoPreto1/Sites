import { z } from 'zod';
import { HttpError } from '../utils/httpError.js';

z.config(z.locales.pt());

export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(new HttpError(400, 'Há campos por corrigir', details));
  }

  req.valid = { ...req.valid, [source]: result.data };
  next();
};
