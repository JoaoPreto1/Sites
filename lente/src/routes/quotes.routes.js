import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { body } from 'express-validator';
import { quotes } from '../repositories/index.js';
import { validate } from '../middleware/validate.js';
import { email, isoDate, optionalText, text } from '../validation/common.js';

export const SERVICE_OPTIONS = ['Fotografia', 'Vídeo', 'Direção de arte', 'Retoque', 'Aluguer de estúdio'];
export const BUDGET_OPTIONS = ['Até 1.000 €', '1.000 € – 2.500 €', '2.500 € – 5.000 €', '5.000 € – 10.000 €', 'Mais de 10.000 €'];

const quoteRules = [
  text('name', { min: 2, max: 80, message: 'Escreva o seu nome' }),
  email(),
  optionalText('company', 80),
  body('services', 'Escolha pelo menos um serviço').isArray({ min: 1, max: SERVICE_OPTIONS.length }),
  body('services.*', 'Serviço inválido').isIn(SERVICE_OPTIONS),
  body('budget', 'Escolha um orçamento aproximado').isIn(BUDGET_OPTIONS),
  isoDate('date').optional(),
  text('message', { min: 20, max: 3000, message: 'Conte-nos um pouco mais sobre o projeto (mínimo 20 caracteres)' }),
];

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Já enviou vários pedidos. Tente novamente daqui a pouco.' },
});

const router = Router();

router.get('/options', (req, res) => res.json({ services: SERVICE_OPTIONS, budgets: BUDGET_OPTIONS }));

router.post('/', limiter, validate(quoteRules), async (req, res) => {
  await quotes.create({ ...req.valid.body, status: 'novo' });
  res.status(201).json({ message: 'Pedido recebido. Respondemos com uma proposta em até dois dias úteis.' });
});

export default router;
