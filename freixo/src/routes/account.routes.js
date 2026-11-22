import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body, id, text } from '../validation/common.js';
import * as requests from '../services/request.service.js';
import * as water from '../services/water.service.js';

const router = Router();

router.use(requireAuth);

// Tudo o que o munícipe vê ao entrar no Balcão Online, num só pedido
router.get('/resumo', async (req, res) => {
  const [mine, issues, agua] = await Promise.all([requests.forUser(req.user.id), requests.issuesForUser(req.user.id), water.forUser(req.user.id)]);
  res.json({ requests: mine, issues, ...agua });
});

router.post(
  '/pedidos',
  validate([
    body('service', 'Escolha um serviço').isString().isLength({ min: 2, max: 60 }),
    text('text', { min: 10, max: 1500, message: 'Explique o pedido (pelo menos 10 caracteres)' }),
  ]),
  async (req, res) => {
    res.status(201).json({ request: await requests.create(req.user, req.valid.body) });
  },
);

router.post('/faturas/:id/pagar', validate([id()], 'params'), async (req, res) => {
  res.json({ invoice: await water.pay(req.user.id, req.params.id) });
});

router.post('/leituras', validate([body('value', 'Escreva a leitura em m³ (só números)').isInt({ min: 0, max: 999999 }).toInt()]), async (req, res) => {
  res.status(201).json({ reading: await water.addReading(req.user.id, req.valid.body.value) });
});

export default router;
