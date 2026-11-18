import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body, id, isoDate, optionalText, query } from '../validation/common.js';
import { lisbonToday } from '../utils/dates.js';
import { adminBookings, adminCancel, dayBoard, setResult, toggleBlock } from '../services/booking.service.js';
import { adminVouchers, setVoucherStatus } from '../services/voucher.service.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/dia', validate([isoDate('data', query).optional()], 'query'), async (req, res) => {
  res.json(await dayBoard(req.valid.query.data ?? lisbonToday()));
});

router.get(
  '/reservas',
  validate([query('estado').optional().isIn(['confirmada', 'jogada', 'cancelada']), query('q').optional().isString().trim().isLength({ max: 60 })], 'query'),
  async (req, res) => {
    res.json({ bookings: await adminBookings({ status: req.valid.query.estado, q: req.valid.query.q }) });
  },
);

router.post(
  '/reservas/:id/resultado',
  validate([id()], 'params'),
  validate([
    body('escaped', 'Diga se saíram').isBoolean().toBoolean(),
    body('minutes', 'Minutos inválidos').default(0).isInt({ min: 0, max: 90 }).toInt(),
    body('seconds', 'Segundos inválidos').default(0).isInt({ min: 0, max: 59 }).toInt(),
    body('hints', 'Pistas inválidas').default(0).isInt({ min: 0, max: 10 }).toInt(),
  ]),
  async (req, res) => {
    res.json({ booking: await setResult(req.valid.params.id, req.valid.body) });
  },
);

router.post('/reservas/:id/cancelar', validate([id()], 'params'), async (req, res) => {
  res.json({ booking: await adminCancel(req.valid.params.id) });
});

router.post(
  '/bloqueios',
  validate([
    body('roomId', 'Sala inválida').isString().isLength({ min: 2, max: 40 }),
    isoDate('date'),
    body('time').optional({ values: 'null' }).matches(/^\d{2}:\d{2}$/),
    optionalText('reason', 80),
  ]),
  async (req, res) => {
    res.json(await toggleBlock(req.valid.body));
  },
);

router.get('/vouchers', async (req, res) => {
  res.json({ vouchers: await adminVouchers() });
});

router.patch('/vouchers/:id', validate([id()], 'params'), validate([body('status').isIn(['ativo', 'por pagar'])]), async (req, res) => {
  res.json({ voucher: await setVoucherStatus(req.valid.params.id, req.valid.body.status) });
});

export default router;
