import { Router } from 'express';
import { requireRole, requireUser } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/limits.js';
import { validate } from '../middleware/validate.js';
import * as projectsService from '../services/projects.service.js';
import { id, oneOf, optionalText, text } from '../validation/common.js';

const router = Router();
router.use(requireUser, requireRole('cliente'));

router.get('/projetos', async (req, res) => {
  res.json({ projects: await projectsService.listForClient(req.user.id) });
});

router.post(
  '/provas/:id/decisao',
  writeLimiter,
  validate([id()], 'params'),
  validate([oneOf('decision', ['aprovada', 'alteracoes'], 'Escolha aprovar ou pedir alterações'), optionalText('comment', 1000)]),
  async (req, res) => {
    res.json({ proof: await projectsService.decideProof(req.valid.params.id, req.user, req.valid.body) });
  },
);

router.post('/projetos/:id/mensagens', writeLimiter, validate([id()], 'params'), validate([text('body', { min: 1, max: 2000, message: 'Escreva a mensagem (até 2000 caracteres)' })]), async (req, res) => {
  res.status(201).json({ message: await projectsService.postMessage(req.valid.params.id, req.user, req.valid.body.body) });
});

router.post('/projetos/:id/lidas', validate([id()], 'params'), async (req, res) => {
  await projectsService.markRead(req.valid.params.id, req.user);
  res.status(204).end();
});

export default router;
