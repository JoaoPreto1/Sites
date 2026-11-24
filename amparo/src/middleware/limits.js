import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../utils/httpError.js';

const limiter = (minutes, limit, message) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: message },
  });

export const authLimiter = limiter(15, 20, 'Demasiadas tentativas. Espere uns minutos e tente de novo.');
export const staffLimiter = limiter(15, 10, 'Demasiadas tentativas na gestão. Espere 15 minutos.');
export const writeLimiter = limiter(10, 30, 'Está a enviar pedidos depressa demais. Espere um pouco.');
export const reportLimiter = limiter(60, 10, 'Já enviou várias denúncias. Tente mais tarde ou escreva-nos.');
export const uploadLimiter = limiter(60, 20, 'Enviou muitos ficheiros. Tente mais tarde.');

// Contra registos automáticos: um campo escondido que só os robôs preenchem
// e um tempo mínimo entre abrir o formulário e enviá-lo
export function antiBot(req, res, next) {
  const { website, startedAt } = req.body ?? {};
  const elapsed = Date.now() - Number(startedAt);
  if (website || !Number.isFinite(elapsed) || elapsed < 2500) {
    return next(new HttpError(400, 'Não foi possível enviar. Recarregue a página e tente de novo.'));
  }
  delete req.body.website;
  delete req.body.startedAt;
  next();
}
