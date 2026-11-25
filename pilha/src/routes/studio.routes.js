import { Router } from 'express';
import { BRIEF_STATUS_KEYS, PEOPLE, PHASE_KEYS, PROOF_IMAGES, SERVICE_SLUGS, WORK_IMAGES } from '../config/site.js';
import { requireRole, requireUser } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/limits.js';
import { validate } from '../middleware/validate.js';
import { journal, users, works } from '../repositories/index.js';
import * as briefsService from '../services/briefs.service.js';
import { allEntries, allWorks } from '../services/content.service.js';
import * as projectsService from '../services/projects.service.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { slugify } from '../utils/slug.js';
import { body, flag, id, oneOf, optionalText, text } from '../validation/common.js';

const router = Router();
router.use(requireUser, requireRole('estudio'));

const params = validate([id()], 'params');
const LEADS = PEOPLE.map((p) => p.name);

// Tudo o que o painel precisa para desenhar as listas de escolha
router.get('/opcoes', (req, res) => {
  res.json({ services: SERVICE_SLUGS, phases: PHASE_KEYS, briefStatus: BRIEF_STATUS_KEYS, leads: LEADS, proofImages: PROOF_IMAGES, workImages: WORK_IMAGES });
});

// Pedidos de briefing
router.get('/pedidos', async (req, res) => res.json({ briefs: await briefsService.list() }));

router.patch('/pedidos/:id', params, validate([oneOf('status', BRIEF_STATUS_KEYS, 'Estado inválido').optional(), optionalText('note', 1000)]), async (req, res) => {
  res.json({ brief: await briefsService.update(req.valid.params.id, req.valid.body) });
});

router.post(
  '/pedidos/:id/aceitar',
  writeLimiter,
  params,
  validate([text('title', { min: 3, max: 120, message: 'Dê um nome ao projeto (3 a 120 caracteres)' }), oneOf('service', SERVICE_SLUGS, 'Escolha o serviço'), oneOf('lead', LEADS, 'Escolha quem lidera')]),
  async (req, res) => {
    res.status(201).json(await briefsService.accept(req.valid.params.id, req.valid.body));
  },
);

// Projetos
router.get('/projetos', async (req, res) => res.json({ projects: await projectsService.listAll() }));

router.patch('/projetos/:id/fase', params, validate([oneOf('phase', PHASE_KEYS, 'Fase inválida')]), async (req, res) => {
  res.json({ project: await projectsService.setPhase(req.valid.params.id, req.valid.body.phase) });
});

router.post(
  '/projetos/:id/provas',
  writeLimiter,
  params,
  validate([text('title', { min: 2, max: 80, message: 'Dê um título à prova' }), optionalText('note', 600), oneOf('image', PROOF_IMAGES.map((i) => i.path), 'Escolha uma imagem')]),
  async (req, res) => {
    res.status(201).json({ proof: await projectsService.addProof(req.valid.params.id, req.valid.body) });
  },
);

router.post('/projetos/:id/mensagens', writeLimiter, params, validate([text('body', { min: 1, max: 2000, message: 'Escreva a mensagem (até 2000 caracteres)' })]), async (req, res) => {
  res.status(201).json({ message: await projectsService.postMessage(req.valid.params.id, req.user, req.valid.body.body) });
});

router.post('/projetos/:id/lidas', params, async (req, res) => {
  await projectsService.markRead(req.valid.params.id, req.user);
  res.status(204).end();
});

// Trabalhos publicados
const workRules = [
  text('title', { min: 3, max: 120, message: 'Título entre 3 e 120 caracteres' }),
  text('client', { min: 2, max: 80, message: 'Nome do cliente entre 2 e 80 caracteres' }),
  text('place', { min: 2, max: 60, message: 'Localidade entre 2 e 60 caracteres' }),
  oneOf('category', SERVICE_SLUGS, 'Escolha o serviço'),
  body('year', 'Ano inválido').isInt({ min: 2000, max: 2100 }).toInt(),
  text('summary', { min: 10, max: 300, message: 'Resumo entre 10 e 300 caracteres' }),
  text('body', { min: 20, max: 6000, message: 'Texto entre 20 e 6000 caracteres' }),
  oneOf('cover', WORK_IMAGES.map((i) => i.path), 'Escolha a imagem de capa'),
  flag('published'),
  flag('featured'),
];

async function uniqueSlug(repo, title, ignoreId) {
  const base = slugify(title) || 'sem-titulo';
  let slug = base;
  for (let n = 2; await repo.findOne((x) => x.slug === slug && x.id !== ignoreId); n++) slug = `${base}-${n}`;
  return slug;
}

const imagesFor = (cover) => WORK_IMAGES.find((i) => i.path === cover)?.details ?? [];

router.get('/trabalhos', async (req, res) => res.json({ works: await allWorks() }));

router.post('/trabalhos', writeLimiter, validate(workRules), async (req, res) => {
  const data = req.valid.body;
  const work = await works.create({ ...data, slug: await uniqueSlug(works, data.title), images: imagesFor(data.cover), published: !!data.published, featured: !!data.featured, publishedAt: new Date().toISOString() });
  res.status(201).json({ work });
});

router.put('/trabalhos/:id', params, validate(workRules), async (req, res) => {
  const current = await works.findById(req.valid.params.id);
  if (!current) throw notFound('Trabalho');
  const data = req.valid.body;
  const publishedAt = data.published && !current.published ? new Date().toISOString() : current.publishedAt;
  res.json({ work: await works.update(current.id, { ...data, images: imagesFor(data.cover), published: !!data.published, featured: !!data.featured, publishedAt }) });
});

router.delete('/trabalhos/:id', params, async (req, res) => {
  if (!(await works.remove(req.valid.params.id))) throw notFound('Trabalho');
  res.status(204).end();
});

// Diário
const entryRules = [
  text('title', { min: 3, max: 120, message: 'Título entre 3 e 120 caracteres' }),
  text('tag', { min: 2, max: 30, message: 'Etiqueta entre 2 e 30 caracteres' }),
  oneOf('author', LEADS, 'Escolha quem assina'),
  text('excerpt', { min: 10, max: 300, message: 'Resumo entre 10 e 300 caracteres' }),
  text('body', { min: 20, max: 8000, message: 'Texto entre 20 e 8000 caracteres' }),
  flag('published'),
];

router.get('/diario', async (req, res) => res.json({ entries: await allEntries() }));

router.post('/diario', writeLimiter, validate(entryRules), async (req, res) => {
  const data = req.valid.body;
  res.status(201).json({ entry: await journal.create({ ...data, slug: await uniqueSlug(journal, data.title), published: !!data.published, publishedAt: new Date().toISOString() }) });
});

router.put('/diario/:id', params, validate(entryRules), async (req, res) => {
  const current = await journal.findById(req.valid.params.id);
  if (!current) throw notFound('Entrada');
  const data = req.valid.body;
  const publishedAt = data.published && !current.published ? new Date().toISOString() : current.publishedAt;
  res.json({ entry: await journal.update(current.id, { ...data, published: !!data.published, publishedAt }) });
});

router.delete('/diario/:id', params, async (req, res) => {
  if (!(await journal.remove(req.valid.params.id))) throw notFound('Entrada');
  res.status(204).end();
});

// Clientes (para mostrar o nome nos projetos)
router.get('/clientes', async (req, res) => {
  const list = await users.findAll((u) => u.role === 'cliente');
  res.json({ clients: list.map(({ passwordHash, ...u }) => u) });
});

router.use((req, res, next) => next(new HttpError(404, 'Endpoint não encontrado')));

export default router;
