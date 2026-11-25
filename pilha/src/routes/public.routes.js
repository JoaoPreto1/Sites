import { Router } from 'express';
import { BUDGET_KEYS, SERVICE_SLUGS } from '../config/site.js';
import { antiBot, briefLimiter } from '../middleware/limits.js';
import { validate } from '../middleware/validate.js';
import * as briefsService from '../services/briefs.service.js';
import { publishedEntries, publishedWorks } from '../services/content.service.js';
import { body, email, isoDay, oneOf, optionalText, query, text } from '../validation/common.js';

const router = Router();

router.get('/trabalhos', validate([query('tipo').optional().isIn(SERVICE_SLUGS)], 'query'), async (req, res) => {
  res.json({ works: await publishedWorks({ category: req.valid.query.tipo }) });
});

router.get('/diario', async (req, res) => {
  res.json({ entries: (await publishedEntries()).map(({ body: _, ...e }) => e) });
});

const briefRules = [
  text('name', { min: 2, max: 80, message: 'Diga-nos o seu nome' }),
  email(),
  optionalText('company', 80),
  body('services', 'Escolha pelo menos um bloco').isArray({ min: 1, max: SERVICE_SLUGS.length }),
  body('services.*', 'Serviço inválido').isIn(SERVICE_SLUGS),
  oneOf('budget', BUDGET_KEYS, 'Escolha um orçamento aproximado'),
  isoDay('deadline'),
  text('message', { min: 20, max: 3000, message: 'Conte-nos o problema em pelo menos 20 caracteres' }),
  body('consent', 'Precisamos da sua autorização para guardar estes dados').equals('true'),
];

router.post('/briefing', briefLimiter, antiBot, validate(briefRules), async (req, res) => {
  const { consent, ...data } = req.valid.body;
  data.services = [...new Set(data.services)];
  data.deadline = data.deadline ?? '';
  data.company = data.company ?? '';
  res.status(201).json(await briefsService.submit(data));
});

export default router;
