import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { offers, subscribers } from '../repositories/index.js';
import { body, email, optionalText, text } from '../validation/common.js';

export const COUNTS = ['Menos de 50', '50 a 200', '200 a 500', 'Mais de 500'];

const offerRules = [
  text('name', { min: 2, max: 80, message: 'Escreve o teu nome' }),
  email(),
  optionalText('phone', 30),
  body('count', 'Mais ou menos quantos discos?').isIn(COUNTS),
  optionalText('genres', 120),
  body('method', 'Escolhe onde fazemos a avaliação').isIn(['casa', 'loja']),
  optionalText('area', 60),
  optionalText('notes', 500),
];

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Já recebemos vários pedidos teus. Tenta daqui a bocado.' },
});

const router = Router();

router.post('/compramos', limiter, validate(offerRules), async (req, res) => {
  await offers.create({ ...req.valid.body, status: 'nova' });
  res.status(201).json({ message: 'Recebido. Respondemos em dois dias úteis com uma proposta de data.' });
});

router.post('/newsletter', limiter, validate([email()]), async (req, res) => {
  const address = req.valid.body.email.toLowerCase();
  if (!(await subscribers.findOne((s) => s.email === address))) await subscribers.create({ email: address });
  res.status(201).json({ message: 'Feito. Recebes as novas entradas às sextas.' });
});

export default router;
