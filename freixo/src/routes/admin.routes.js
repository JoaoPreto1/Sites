import { Router } from 'express';
import { NEWS_CATEGORIES, NOTICE_TYPES, REQUEST_STATUS } from '../config/municipio.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body, id, optionalText, query, text } from '../validation/common.js';
import { messages } from '../repositories/index.js';
import * as content from '../services/content.service.js';
import * as requests from '../services/request.service.js';
import { notFound } from '../utils/httpError.js';

const STATUS = REQUEST_STATUS.map(([v]) => v);
const PHOTOS = ['vila', 'amendoeiras', 'douro', 'penedo', 'matriz', 'seda', 'torre', 'congida'];

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/resumo', async (req, res) => {
  const [counts, issues, inbox, news, notices, events] = await Promise.all([
    requests.counts(),
    requests.listIssues(),
    messages.findAll(),
    content.listNews({ all: true }),
    content.listNotices({ all: true }),
    content.listEvents(),
  ]);
  res.json({
    counts,
    openIssues: issues.filter((o) => o.status !== 'concluido').length,
    unread: inbox.filter((m) => !m.read).length,
    news: news.length,
    notices: notices.length,
    events: events.length,
  });
});

// Pedidos e ocorrências
router.get('/pedidos', validate([query('estado').optional().isIn(STATUS)], 'query'), async (req, res) => {
  res.json({ requests: await requests.listAll({ status: req.valid.query.estado }), counts: await requests.counts() });
});

router.patch('/pedidos/:id', validate([id(), body('status', 'Estado inválido').isIn(STATUS), optionalText('note', 300)]), async (req, res) => {
  res.json({ request: await requests.updateStatus(req.params.id, req.valid.body) });
});

router.get('/ocorrencias', async (req, res) => {
  res.json({ issues: await requests.listIssues() });
});

router.patch('/ocorrencias/:id', validate([id(), body('status', 'Estado inválido').isIn(STATUS)]), async (req, res) => {
  res.json({ issue: await requests.updateIssue(req.params.id, req.valid.body.status) });
});

// Mensagens do formulário de contacto
router.get('/mensagens', async (req, res) => {
  res.json({ messages: (await messages.findAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

router.post('/mensagens/:id/lida', validate([id()], 'params'), async (req, res) => {
  const message = await messages.update(req.params.id, { read: true });
  if (!message) throw notFound('Mensagem');
  res.json({ message });
});

// Notícias
router.get('/noticias', async (req, res) => {
  res.json({ news: (await content.listNews({ all: true })).map(({ body, ...n }) => n) });
});

router.post(
  '/noticias',
  validate([
    text('title', { min: 10, max: 140, message: 'O título precisa de 10 a 140 caracteres' }),
    text('summary', { min: 20, max: 280, message: 'O resumo precisa de 20 a 280 caracteres' }),
    body('cat', 'Escolha a categoria').isIn(NEWS_CATEGORIES.map(([v]) => v)),
    text('label', { min: 2, max: 30, message: 'Escreva a etiqueta (ex.: Cultura)' }),
    body('photo', 'Escolha a fotografia').isIn(PHOTOS),
    text('text', { min: 40, max: 8000, message: 'Escreva o texto da notícia (pelo menos 40 caracteres)' }),
    body('published').default(true).isBoolean().toBoolean(),
  ]),
  async (req, res) => {
    res.status(201).json({ news: await content.createNews(req.valid.body) });
  },
);

router.patch('/noticias/:id', validate([id(), body('published', 'Valor inválido').isBoolean({ strict: true })]), async (req, res) => {
  res.json({ news: await content.setNewsPublished(req.params.id, req.valid.body.published) });
});

router.delete('/noticias/:id', validate([id()], 'params'), async (req, res) => {
  await content.removeNews(req.params.id);
  res.status(204).end();
});

// Avisos à população
router.get('/avisos', async (req, res) => {
  res.json({ notices: await content.listNotices({ all: true }) });
});

router.post(
  '/avisos',
  validate([
    body('type', 'Escolha o tipo').isIn(NOTICE_TYPES.map(([v]) => v)),
    text('title', { min: 5, max: 80, message: 'Escreva o título do aviso' }),
    text('text', { min: 5, max: 200, message: 'Escreva o aviso' }),
    text('when', { min: 3, max: 60, message: 'Diga quando (ex.: terça, 9h00–13h00)' }),
    body('until', 'Data inválida').isDate({ format: 'YYYY-MM-DD', strictMode: true }).customSanitizer((v) => new Date(`${v}T23:59:00`).toISOString()),
    body('pinned').default(false).isBoolean().toBoolean(),
  ]),
  async (req, res) => {
    res.status(201).json({ notice: await content.createNotice(req.valid.body) });
  },
);

router.delete('/avisos/:id', validate([id()], 'params'), async (req, res) => {
  await content.removeNotice(req.params.id);
  res.status(204).end();
});

// Agenda
router.get('/agenda', async (req, res) => {
  res.json({ events: await content.listEvents() });
});

router.post(
  '/agenda',
  validate([
    body('date', 'Data e hora inválidas').isISO8601({ strict: true }).customSanitizer((v) => new Date(v).toISOString()),
    text('title', { min: 3, max: 80, message: 'Escreva o nome do evento' }),
    text('place', { min: 3, max: 100, message: 'Diga onde e a que horas' }),
  ]),
  async (req, res) => {
    res.status(201).json({ event: await content.createEvent(req.valid.body) });
  },
);

router.delete('/agenda/:id', validate([id()], 'params'), async (req, res) => {
  await content.removeEvent(req.params.id);
  res.status(204).end();
});

export default router;
