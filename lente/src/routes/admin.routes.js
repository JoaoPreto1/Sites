import { Router } from 'express';
import { body } from 'express-validator';
import { galleries, projects, quotes, users } from '../repositories/index.js';
import * as gallery from '../services/gallery.service.js';
import { createClient, publicUser } from '../services/auth.service.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { email, isoDate, optionalText, password, text } from '../validation/common.js';
import { today } from '../utils/dates.js';
import { notFound } from '../utils/httpError.js';

const QUOTE_STATUSES = ['novo', 'em conversa', 'aceite', 'recusado'];

const quoteStatus = [body('status', 'Estado inválido').isIn(QUOTE_STATUSES)];

const clientInput = [
  text('name', { min: 2, max: 80, message: 'Escreva o nome do cliente' }),
  email(),
  optionalText('company', 80),
  optionalText('phone', 30),
  password('password'),
];

const flag = (field) => body(field, 'Valor inválido').isBoolean({ strict: true }).toBoolean(true);
const futureDate = (field) =>
  isoDate(field)
    .custom((value) => value > today())
    .withMessage('A data de expiração tem de ser no futuro');
const title = () => text('title', { min: 3, max: 120, message: 'Dê um título à galeria' });

const galleryInput = [
  title(),
  body('clientId', 'Escolha o cliente').isString().notEmpty(),
  optionalText('project', 120),
  isoDate('shotOn'),
  futureDate('expiresAt'),
  body('allowDownload', 'Valor inválido').default(false).isBoolean({ strict: true }).toBoolean(true),
  body('photoUrls', 'Junte entre 1 e 200 fotografias').isArray({ min: 1, max: 200 }),
  body('photoUrls.*', 'Use links https://images.unsplash.com/…').isURL({
    protocols: ['https'],
    require_protocol: true,
    host_whitelist: ['images.unsplash.com'],
  }),
];

const galleryUpdate = [flag('allowDownload').optional(), isoDate('expiresAt').optional(), title().optional()];

const projectUpdate = [flag('published').optional(), flag('featured').optional()];

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/overview', async (req, res) => {
  const [allQuotes, allGalleries, clients, allProjects] = await Promise.all([
    quotes.findAll(),
    galleries.findAll(),
    users.findAll((u) => u.role === 'cliente'),
    projects.findAll(),
  ]);
  const now = today();
  const active = allGalleries.filter((g) => g.expiresAt >= now);

  res.json({
    stats: {
      newQuotes: allQuotes.filter((q) => q.status === 'novo').length,
      activeGalleries: active.length,
      favorites: active.reduce((sum, g) => sum + g.favorites.length, 0),
      downloads: allGalleries.reduce((sum, g) => sum + g.downloads, 0),
      clients: clients.length,
      projects: allProjects.filter((p) => p.published).length,
    },
    latestQuotes: allQuotes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
    expiringSoon: active
      .filter((g) => g.expiresAt <= new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10))
      .map(gallery.summary),
  });
});

router.get('/quotes', async (req, res) => {
  const list = await quotes.findAll();
  res.json({ quotes: list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), statuses: QUOTE_STATUSES });
});

router.patch('/quotes/:id', validate(quoteStatus), async (req, res) => {
  const quote = await quotes.update(req.params.id, req.valid.body);
  if (!quote) throw notFound('Pedido');
  res.json({ quote });
});

router.get('/clients', async (req, res) => {
  const [list, allGalleries] = await Promise.all([users.findAll((u) => u.role === 'cliente'), galleries.findAll()]);
  res.json({
    clients: list.map((u) => ({ ...publicUser(u), galleries: allGalleries.filter((g) => g.clientId === u.id).length })),
  });
});

router.post('/clients', validate(clientInput), async (req, res) => {
  res.status(201).json({ client: await createClient(req.valid.body) });
});

router.get('/galleries', async (req, res) => {
  const [list, clients] = await Promise.all([gallery.listFor(req.user), users.findAll((u) => u.role === 'cliente')]);
  const names = Object.fromEntries(clients.map((c) => [c.id, c.company || c.name]));
  res.json({ galleries: list.map((g) => ({ ...g, clientName: names[g.clientId] ?? '—' })) });
});

router.post('/galleries', validate(galleryInput), async (req, res) => {
  res.status(201).json({ gallery: await gallery.createGallery(req.valid.body) });
});

router.patch('/galleries/:id', validate(galleryUpdate), async (req, res) => {
  res.json({ gallery: await gallery.updateGallery(req.params.id, req.valid.body) });
});

router.delete('/galleries/:id', async (req, res) => {
  await gallery.removeGallery(req.params.id);
  res.status(204).end();
});

router.get('/projects', async (req, res) => {
  const list = await projects.findAll();
  res.json({ projects: list.sort((a, b) => b.year - a.year).map(({ description, gallery: photos, team, ...p }) => p) });
});

router.patch('/projects/:id', validate(projectUpdate), async (req, res) => {
  const project = await projects.update(req.params.id, req.valid.body);
  if (!project) throw notFound('Projeto');
  res.json({ project });
});

export default router;
