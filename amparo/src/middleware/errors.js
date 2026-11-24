import { HttpError } from '../utils/httpError.js';

export function apiNotFound(req, res, next) {
  next(new HttpError(404, 'Endpoint não encontrado'));
}

export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'O pedido não tem um JSON válido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'O pedido é demasiado grande' });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'O ficheiro tem mais de 5 MB' });
  if (err.name === 'MulterError') return res.status(400).json({ error: 'Envie um ficheiro de cada vez' });

  const status = err.status ?? 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    error: status >= 500 ? 'Ocorreu um erro inesperado' : err.message,
    ...(err.details && { details: err.details }),
  });
}
