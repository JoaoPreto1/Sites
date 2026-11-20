import { Router } from 'express';
import { REQUEST_STATUS } from '../config/studio.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body, id, optionalText, query, text } from '../validation/common.js';
import * as projects from '../services/project.service.js';
import * as requests from '../services/request.service.js';
import * as works from '../services/work.service.js';

const STATUS = REQUEST_STATUS.map(([v]) => v);

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/resumo', async (req, res) => {
  const [counts, all] = await Promise.all([requests.counts(), works.list()]);
  const now = new Date().toISOString();
  const meetings = all
    .flatMap((w) => w.meetings.filter((m) => m.at >= now).map((m) => ({ ...m, work: w.title, workId: w.id, client: w.owner?.name })))
    .sort((a, b) => a.at.localeCompare(b.at));
  res.json({ counts, meetings, unread: all.reduce((n, w) => n + w.unread, 0) });
});

router.get('/pedidos', validate([query('estado').optional().isIn(STATUS)], 'query'), async (req, res) => {
  res.json({ requests: await requests.list({ status: req.valid.query.estado }), counts: await requests.counts() });
});

router.patch(
  '/pedidos/:id',
  validate([id(), body('status', 'Estado inválido').optional().isIn(STATUS), optionalText('notes', 1000)]),
  async (req, res) => {
    const { status, notes } = req.valid.body;
    res.json({ request: await requests.update(req.params.id, { ...(status && { status }), ...(notes !== undefined && { notes }) }) });
  },
);

router.get('/obras', async (req, res) => {
  res.json({ works: await works.list() });
});

router.post('/obras/:id/lida', validate([id()]), async (req, res) => {
  res.json({ work: await works.markRead(req.params.id) });
});

router.post('/obras/:id/fase', validate([id(), body('direction', 'Sentido inválido').isIn(['avancar', 'recuar'])]), async (req, res) => {
  res.json({ work: await works.step(req.params.id, req.valid.body.direction) });
});

router.post('/obras/:id/mensagens', validate([id(), text('text', { min: 1, max: 1000, message: 'Escreva a mensagem' })]), async (req, res) => {
  res.status(201).json({ work: await works.staffMessage(req.params.id, req.valid.body.text) });
});

router.post(
  '/obras/:id/reunioes',
  validate([
    id(),
    body('at', 'Data e hora inválidas').isISO8601({ strict: true }).customSanitizer((v) => new Date(v).toISOString()),
    text('topic', { min: 3, max: 120, message: 'Escreva o assunto da reunião' }),
    text('where', { min: 2, max: 80, message: 'Escreva onde é a reunião' }),
  ]),
  async (req, res) => {
    res.status(201).json({ work: await works.addMeeting(req.params.id, req.valid.body) });
  },
);

router.get('/projetos', async (req, res) => {
  res.json({ projects: await projects.listAll() });
});

router.patch('/projetos/:id', validate([id(), body('published', 'Valor inválido').isBoolean({ strict: true })]), async (req, res) => {
  res.json({ project: await projects.setPublished(req.params.id, req.valid.body.published) });
});

router.post('/projetos/:id/mover', validate([id(), body('direction', 'Sentido inválido').isIn(['cima', 'baixo'])]), async (req, res) => {
  res.json({ projects: await projects.move(req.params.id, req.valid.body.direction) });
});

export default router;
