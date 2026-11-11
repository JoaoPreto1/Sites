import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { messages } from '../repositories/index.js';
import { validate } from '../middleware/validate.js';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Escreva o seu nome').max(80),
  email: z.email('Escreva um email válido'),
  subject: z.string().trim().min(3, 'Escreva um assunto').max(120),
  message: z.string().trim().min(10, 'A mensagem é demasiado curta').max(2000),
});

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Já enviou várias mensagens. Tente novamente daqui a pouco.' },
});

const router = Router();

router.post('/', limiter, validate(contactSchema), async (req, res) => {
  await messages.create({ ...req.valid.body, status: 'nova' });
  res.status(201).json({ message: 'Mensagem recebida. Respondemos em menos de 24 horas.' });
});

export default router;
