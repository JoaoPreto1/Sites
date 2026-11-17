import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addMessage, decideProof, getJob, listJobs } from '../services/job.service.js';
import { body, id, text } from '../validation/common.js';

const proofRules = [
  id('id'),
  id('proofId'),
  body('decision', 'Escolha aprovar ou pedir alterações').isIn(['aprovado', 'alteracoes']),
  body('comment').optional().isString().trim().isLength({ max: 600 }),
];

const messageRules = [id('id'), text('text', { min: 1, max: 1000, message: 'Escreva a mensagem' })];

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  res.json({ jobs: await listJobs(req.user) });
});

router.get('/:id', async (req, res) => {
  res.json({ job: await getJob(req.params.id, req.user) });
});

router.patch('/:id/provas/:proofId', validate(proofRules), async (req, res) => {
  res.json({ job: await decideProof(req.params.id, req.params.proofId, req.valid.body, req.user) });
});

router.post('/:id/mensagens', validate(messageRules), async (req, res) => {
  res.status(201).json({ job: await addMessage(req.params.id, req.valid.body.text, req.user) });
});

export default router;
