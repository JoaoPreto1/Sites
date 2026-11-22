import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { FREGUESIAS, ISSUE_TYPES, NEWS_CATEGORIES, SERVICE_CATEGORIES } from '../config/municipio.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body, email, optionalText, query, text } from '../validation/common.js';
import { messages, subscribers } from '../repositories/index.js';
import * as content from '../services/content.service.js';
import * as requests from '../services/request.service.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados envios. Espere uns minutos e tente de novo.' },
});

const consent = body('consent', 'Precisa de aceitar o tratamento dos dados').equals('true');

const router = Router();

router.get('/servicos', validate([query('categoria').optional().isIn(SERVICE_CATEGORIES.map(([v]) => v))], 'query'), async (req, res) => {
  const all = await content.listServices();
  const cat = req.valid.query.categoria;
  res.json({ services: cat ? all.filter((s) => s.cat === cat) : all });
});

router.get('/noticias', validate([query('categoria').optional().isIn(NEWS_CATEGORIES.map(([v]) => v))], 'query'), async (req, res) => {
  res.json({ news: (await content.listNews({ cat: req.valid.query.categoria })).map(({ body, ...n }) => n) });
});

router.get('/noticias/:slug', async (req, res, next) => {
  const item = await content.findNews(req.params.slug);
  if (!item) return next();
  res.json({ news: item });
});

router.get('/agenda', async (req, res) => {
  res.json({ events: await content.listEvents() });
});

router.get('/avisos', async (req, res) => {
  res.json({ notices: await content.listNotices() });
});

router.get('/editais', async (req, res) => {
  res.json({ editais: await content.listEditais() });
});

router.post(
  '/mensagens',
  limiter,
  validate([
    text('name', { min: 2, max: 80, message: 'Escreva o seu nome' }),
    email(),
    text('subject', { min: 2, max: 60, message: 'Escolha o assunto' }),
    body('freguesia', 'Escolha a freguesia').optional({ values: 'falsy' }).isIn(FREGUESIAS.map((f) => f.slug)),
    text('text', { min: 10, max: 2000, message: 'Escreva a mensagem (pelo menos 10 caracteres)' }),
    consent,
  ]),
  async (req, res) => {
    const { consent: _, ...data } = req.valid.body;
    const message = await messages.create({ ...data, read: false });
    res.status(201).json({ message: 'Mensagem recebida', id: message.id });
  },
);

router.post(
  '/ocorrencias',
  limiter,
  optionalAuth,
  validate([
    body('type', 'Escolha o tipo de problema').isIn(ISSUE_TYPES.map(([v]) => v)),
    text('place', { min: 4, max: 120, message: 'Diga onde é (rua, aldeia ou ponto de referência)' }),
    text('text', { min: 10, max: 1000, message: 'Descreva o problema (pelo menos 10 caracteres)' }),
    optionalText('name', 80),
  ]),
  async (req, res) => {
    const issue = await requests.createIssue(req.user, req.valid.body);
    res.status(201).json({ issue });
  },
);

router.post('/newsletter', limiter, validate([email(), consent]), async (req, res) => {
  const address = req.valid.body.email.toLowerCase();
  if (!(await subscribers.findOne((s) => s.email === address))) await subscribers.create({ email: address });
  res.status(201).json({ message: 'Subscrição feita' });
});

export default router;
