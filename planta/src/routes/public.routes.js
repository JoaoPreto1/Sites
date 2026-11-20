import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { BUDGETS, SITUATIONS } from '../config/studio.js';
import { validate } from '../middleware/validate.js';
import { body, email, optionalText, text } from '../validation/common.js';
import { listPublished } from '../services/project.service.js';
import * as requests from '../services/request.service.js';

const requestRules = [
  text('name', { min: 2, max: 80, message: 'Escreva o seu nome' }),
  email(),
  optionalText('phone', 30),
  body('situation', 'Escolha o que tem').isIn(SITUATIONS.map(([v]) => v)),
  body('budget', 'Escolha um orçamento').optional().isIn(BUDGETS.map(([v]) => v)),
  optionalText('place', 80),
  text('message', { min: 10, max: 2000, message: 'Conte-nos um pouco mais (pelo menos 10 caracteres)' }),
];

// Um formulário público não deve poder ser usado para encher a caixa de pedidos
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Já recebemos vários pedidos seus. Tente outra vez daqui a uma hora ou ligue-nos.' },
});

const router = Router();

router.get('/projetos', async (req, res) => {
  const list = await listPublished();
  res.json({ projects: list.map(({ id, slug, n, name, type, place, year, summary }) => ({ id, slug, n, name, type, place, year, summary })) });
});

router.post('/pedidos', limiter, validate(requestRules), async (req, res) => {
  res.status(201).json({ request: await requests.create(req.valid.body) });
});

export default router;
