import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { id, text } from '../validation/common.js';
import * as works from '../services/work.service.js';

const router = Router();

router.use(requireAuth);

router.get('/obra', async (req, res) => {
  res.json({ work: await works.forClient(req.user.id) });
});

router.post('/obra/mensagens', validate([text('text', { min: 1, max: 1000, message: 'Escreva a mensagem' })]), async (req, res) => {
  res.status(201).json({ work: await works.clientMessage(req.user.id, req.valid.body.text) });
});

router.post('/obra/reunioes/:id/confirmar', validate([id()], 'params'), async (req, res) => {
  res.json({ work: await works.confirmMeeting(req.user.id, req.params.id) });
});

export default router;
