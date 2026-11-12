import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { subscribers } from '../repositories/index.js';
import { validate } from '../middleware/validate.js';
import { email } from '../validation/common.js';

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados pedidos. Tente mais tarde.' },
});

const router = Router();

router.post('/', limiter, validate([email()]), async (req, res) => {
  const address = req.valid.body.email.toLowerCase();
  const exists = await subscribers.findOne((s) => s.email === address);
  if (!exists) await subscribers.create({ email: address });
  res.status(201).json({ message: 'Obrigado! Vai receber a próxima newsletter.' });
});

export default router;
