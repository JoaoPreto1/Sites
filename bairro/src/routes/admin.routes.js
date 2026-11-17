import { Router } from 'express';
import { PHASES, REQUEST_STATUS } from '../config/studio.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addProof, createFromRequest, listJobs, setPhase } from '../services/job.service.js';
import { listProjects, updateProject } from '../services/project.service.js';
import { listRequests, updateRequest } from '../services/quote.service.js';
import { listAvailability, updateAvailability } from '../services/studio.service.js';
import { lisbonToday } from '../utils/dates.js';
import { body, id, isoDate, optionalText, photoId, query, text } from '../validation/common.js';

const statusIds = REQUEST_STATUS.map((s) => s.id);

const requestQuery = [query('estado', 'Estado inválido').optional().isIn(statusIds)];
const requestRules = [id(), body('status', 'Estado inválido').optional().isIn(statusIds), optionalText('note', 300)];
const jobRules = [
  id(),
  text('title', { min: 3, max: 100, message: 'Dê um nome ao trabalho' }),
  isoDate('dueDate', body, 'Escolha a data de entrega')
    .custom((value) => value > lisbonToday())
    .withMessage('A entrega tem de ser depois de hoje'),
];
const phaseRules = [id(), body('phase', 'Fase inválida').isInt({ min: 0, max: PHASES.length - 1 }).toInt()];
const proofRules = [id(), text('name', { min: 3, max: 80, message: 'Dê um nome ao ficheiro' }), photoId('photo')];
const projectRules = [id(), body('published').optional().isBoolean({ strict: true }), body('featured').optional().isBoolean({ strict: true })];
const availabilityRules = [
  id(),
  body('slots', 'Entre 0 e 10 vagas').optional().isInt({ min: 0, max: 10 }).toInt(),
  body('taken', 'Entre 0 e 10 vagas').optional().isInt({ min: 0, max: 10 }).toInt(),
];

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/resumo', async (req, res) => {
  const [requests, jobs, availability] = await Promise.all([listRequests(), listJobs(req.user), listAvailability()]);
  res.json({
    newRequests: requests.filter((r) => r.status === 'novo').length,
    openRequests: requests.filter((r) => ['novo', 'em-analise'].includes(r.status)).length,
    activeJobs: jobs.filter((j) => j.phase < PHASES.length - 1).length,
    pendingProofs: jobs.reduce((sum, j) => sum + j.pending, 0),
    nextOpening: availability.find((m) => m.free > 0) ?? null,
  });
});

router.get('/pedidos', validate(requestQuery, 'query'), async (req, res) => {
  res.json({ requests: await listRequests({ status: req.valid.query.estado }), statuses: REQUEST_STATUS });
});

router.patch('/pedidos/:id', validate(requestRules), async (req, res) => {
  res.json({ request: await updateRequest(req.params.id, req.valid.body) });
});

router.post('/pedidos/:id/trabalho', validate(jobRules), async (req, res) => {
  res.status(201).json({ job: await createFromRequest(req.params.id, req.valid.body) });
});

router.get('/trabalhos', async (req, res) => {
  res.json({ jobs: await listJobs(req.user), phases: PHASES });
});

router.patch('/trabalhos/:id', validate(phaseRules), async (req, res) => {
  res.json({ job: await setPhase(req.params.id, req.valid.body.phase) });
});

router.post('/trabalhos/:id/provas', validate(proofRules), async (req, res) => {
  res.status(201).json({ job: await addProof(req.params.id, req.valid.body) });
});

router.get('/projetos', async (req, res) => {
  res.json({ projects: await listProjects({ all: true }) });
});

router.patch('/projetos/:id', validate(projectRules), async (req, res) => {
  res.json({ project: await updateProject(req.params.id, req.valid.body) });
});

router.get('/vagas', async (req, res) => {
  res.json({ availability: await listAvailability() });
});

router.patch('/vagas/:id', validate(availabilityRules), async (req, res) => {
  res.json({ month: await updateAvailability(req.params.id, req.valid.body) });
});

export default router;
