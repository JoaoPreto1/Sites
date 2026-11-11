import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { quotes } from '../repositories/index.js';
import { validate } from '../middleware/validate.js';
import { isoDate } from '../validation/common.js';

export const SERVICE_OPTIONS = ['Fotografia', 'Vídeo', 'Direção de arte', 'Retoque', 'Aluguer de estúdio'];
export const BUDGET_OPTIONS = ['Até 1.000 €', '1.000 € – 2.500 €', '2.500 € – 5.000 €', '5.000 € – 10.000 €', 'Mais de 10.000 €'];

const quoteSchema = z.object({
  name: z.string().trim().min(2, 'Escreva o seu nome').max(80),
  email: z.email('Escreva um email válido'),
  company: z.string().trim().max(80).optional(),
  services: z.array(z.enum(SERVICE_OPTIONS)).min(1, 'Escolha pelo menos um serviço'),
  budget: z.enum(BUDGET_OPTIONS, { error: 'Escolha um orçamento aproximado' }),
  date: isoDate.optional(),
  message: z.string().trim().min(20, 'Conte-nos um pouco mais sobre o projeto (mínimo 20 caracteres)').max(3000),
});

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Já enviou vários pedidos. Tente novamente daqui a pouco.' },
});

const router = Router();

router.get('/options', (req, res) => res.json({ services: SERVICE_OPTIONS, budgets: BUDGET_OPTIONS }));

router.post('/', limiter, validate(quoteSchema), async (req, res) => {
  await quotes.create({ ...req.valid.body, status: 'novo' });
  res.status(201).json({ message: 'Pedido recebido. Respondemos com uma proposta em até dois dias úteis.' });
});

export default router;
