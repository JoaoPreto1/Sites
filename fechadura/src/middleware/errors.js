import { HttpError } from '../utils/httpError.js';

export function apiNotFound(req, res, next) {
  next(new HttpError(404, 'Endpoint não encontrado'));
}

export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'O pedido não tem um JSON válido' });
  }

  const status = err.status ?? 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    error: status >= 500 ? 'Ocorreu um erro inesperado' : err.message,
    ...(err.details && { details: err.details }),
  });
}
