import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { CATEGORIES } from '../config/studio.js';
import { BUDGETS, estimate, EXTRAS, SERVICES } from '../../public/js/shared/estimate.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { categoryCounts, listProjects, projectDetail } from '../services/project.service.js';
import { createRequest, myRequests } from '../services/quote.service.js';
import { listAvailability, listTeam } from '../services/studio.service.js';
import { lisbonToday } from '../utils/dates.js';
import { body, email, isoDate, listOf, optionalText, query, text } from '../validation/common.js';

const serviceIds = SERVICES.map((s) => s.id);
const extraIds = EXTRAS.map((e) => e.id);

const projectQuery = [query('categoria', 'Categoria inválida').optional().isIn(CATEGORIES.map((c) => c.slug))];

const estimateRules = [...listOf('services', serviceIds, { min: 1 }), ...listOf('extras', extraIds)];

const requestRules = [
  text('name', { min: 2, max: 80, message: 'Escreva o seu nome' }),
  email(),
  optionalText('company', 80),
  ...listOf('services', serviceIds),
  ...listOf('extras', extraIds),
  body('budget', 'Escolha um valor aproximado').isIn(BUDGETS.map(([value]) => value)),
  isoDate('deadline', body, 'Escolha uma data válida')
    .optional({ values: 'falsy' })
    .custom((value) => value > lisbonToday())
    .withMessage('A data tem de ser depois de hoje'),
  text('message', { min: 10, max: 2000, message: 'Conte-nos em poucas linhas o que precisa (pelo menos 10 caracteres)' }),
];

// Pedidos de orçamento são abertos a todos: um limite evita que alguém encha a caixa de entrada
const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Já recebemos vários pedidos seus. Escreva-nos para ola@bairro.studio.' },
});

const router = Router();

router.get('/projetos', validate(projectQuery, 'query'), async (req, res) => {
  const [projects, categories] = await Promise.all([listProjects(req.valid.query), categoryCounts()]);
  res.json({ projects, categories });
});

router.get('/projetos/:slug', async (req, res) => {
  res.json({ project: await projectDetail(req.params.slug) });
});

router.get('/equipa', async (req, res) => {
  const [team, availability] = await Promise.all([listTeam(), listAvailability()]);
  res.json({ team, availability });
});

router.get('/servicos', (req, res) => {
  res.json({ services: SERVICES, extras: EXTRAS, budgets: BUDGETS });
});

router.post('/orcamento/estimativa', validate(estimateRules), (req, res) => {
  const { services, extras } = req.valid.body;
  res.json({ estimate: estimate(services, extras) });
});

router.post('/pedidos', requestLimiter, optionalAuth, validate(requestRules), async (req, res) => {
  const request = await createRequest(req.valid.body, req.user);
  res.status(201).json({ request });
});

router.get('/pedidos/meus', requireAuth, async (req, res) => {
  res.json({ requests: await myRequests(req.user) });
});

export default router;
