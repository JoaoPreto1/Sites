import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { messages } from '../repositories/index.js';
import { validate } from '../middleware/validate.js';
import { email, text } from '../validation/common.js';

const contactRules = [
  text('name', { min: 2, max: 80, message: 'Escreva o seu nome' }),
  email(),
  text('subject', { min: 3, max: 120, message: 'Escreva um assunto' }),
  text('message', { min: 10, max: 2000, message: 'A mensagem é demasiado curta' }),
];

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Já enviou várias mensagens. Tente novamente daqui a pouco.' },
});

const router = Router();

router.post('/', limiter, validate(contactRules), async (req, res) => {
  await messages.create({ ...req.valid.body, status: 'nova' });
  res.status(201).json({ message: 'Mensagem recebida. Respondemos em menos de 24 horas.' });
});

export default router;
