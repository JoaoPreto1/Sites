import { Router } from 'express';
import { body, query } from 'express-validator';
import * as owner from '../services/owner.service.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { isoDate } from '../validation/common.js';
import { today } from '../utils/dates.js';

const bookingsQuery = [
  query('status', 'Estado inválido').optional().isIn(['pendente', 'confirmada', 'cancelada', 'concluida']),
  query('propertyId').optional().isString(),
];

const statusInput = [body('status', 'Estado inválido').isIn(['confirmada', 'cancelada', 'concluida'])];

const propertyInput = [
  body('pricePerNight', 'Preço entre 20 € e 5000 €').optional().isFloat({ min: 20, max: 5000 }).toFloat(),
  body('cleaningFee', 'Limpeza entre 0 € e 1000 €').optional().isFloat({ min: 0, max: 1000 }).toFloat(),
  body('minNights', 'Entre 1 e 30 noites').optional().isInt({ min: 1, max: 30 }).toInt(),
  body('active', 'Valor inválido').optional().isBoolean({ strict: true }).toBoolean(true),
];

const blockInput = [
  body('propertyId', 'Escolha a casa').isString().notEmpty(),
  isoDate('from'),
  isoDate('to')
    .custom((to, { req }) => to > req.body.from)
    .withMessage('A data final tem de ser depois da inicial')
    .custom((to) => to > today())
    .withMessage('O bloqueio tem de terminar no futuro'),
  body('reason').optional().isString().trim().isLength({ max: 120 }),
];

const messageInput = [body('status', 'Estado inválido').isIn(['nova', 'lida', 'respondida'])];

const router = Router();
router.use(requireAuth, requireRole('proprietario', 'admin'));

router.get('/overview', async (req, res) => {
  res.json(await owner.overview(req.user));
});

router.get('/bookings', validate(bookingsQuery, 'query'), async (req, res) => {
  res.json({ bookings: await owner.listBookings(req.user, req.valid.query) });
});

router.patch('/bookings/:code', validate(statusInput), async (req, res) => {
  res.json({ booking: await owner.changeStatus(req.user, req.params.code, req.valid.body.status) });
});

router.get('/properties', async (req, res) => {
  res.json({ properties: await owner.ownedProperties(req.user) });
});

router.patch('/properties/:id', validate(propertyInput), async (req, res) => {
  res.json({ property: await owner.updateProperty(req.user, req.params.id, req.valid.body) });
});

router.get('/blocks', async (req, res) => {
  res.json({ blocks: await owner.listBlocks(req.user) });
});

router.post('/blocks', validate(blockInput), async (req, res) => {
  res.status(201).json({ block: await owner.createBlock(req.user, req.valid.body) });
});

router.delete('/blocks/:id', async (req, res) => {
  await owner.removeBlock(req.user, req.params.id);
  res.status(204).end();
});

router.get('/messages', async (req, res) => {
  res.json({ messages: await owner.listMessages() });
});

router.patch('/messages/:id', validate(messageInput), async (req, res) => {
  res.json({ message: await owner.updateMessage(req.params.id, req.valid.body.status) });
});

export default router;
