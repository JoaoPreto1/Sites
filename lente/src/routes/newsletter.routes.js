import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { subscribers } from '../repositories/index.js';
import { validate } from '../middleware/validate.js';

const schema = z.object({ email: z.email('Escreva um email válido') });

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados pedidos. Tente mais tarde.' },
});

const router = Router();

router.post('/', limiter, validate(schema), async (req, res) => {
  const email = req.valid.body.email.toLowerCase();
  const exists = await subscribers.findOne((s) => s.email === email);
  if (!exists) await subscribers.create({ email });
  res.status(201).json({ message: 'Obrigado! Vai receber a próxima newsletter.' });
});

export default router;
