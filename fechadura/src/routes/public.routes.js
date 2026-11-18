import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body, email, isoDate, optionalText, param, query, text } from '../validation/common.js';
import { MAX_PLAYERS, MIN_PLAYERS } from '../../public/js/shared/pricing.js';
import { listRooms, roomBySlug } from '../services/room.service.js';
import { availability, calendar, createBooking } from '../services/booking.service.js';
import { escapeLog } from '../services/ranking.service.js';
import { checkVoucher, createVoucher } from '../services/voucher.service.js';

const players = (field = 'players') => body(field, `Entre ${MIN_PLAYERS} e ${MAX_PLAYERS} pessoas`).isInt({ min: MIN_PLAYERS, max: MAX_PLAYERS }).toInt();
const slug = (field) => body(field, 'Escolha uma sala').isString().trim().matches(/^[a-z0-9-]{3,60}$/);
const voucherCode = (field) => body(field, 'Código de voucher inválido').optional({ values: 'falsy' }).isString().trim().toUpperCase().matches(/^CHAVE-[A-Z0-9]{4}$/);

const bookingRules = [
  slug('room'),
  isoDate('date', body, 'Escolha o dia'),
  body('time', 'Escolha a hora').matches(/^\d{2}:\d{2}$/),
  players(),
  text('name', { min: 2, max: 80, message: 'Escreva o seu nome' }),
  email(),
  optionalText('phone', 30),
  optionalText('team', 40),
  voucherCode('voucher'),
];

const voucherRules = [
  body('room').optional({ values: 'falsy' }).isString().trim().matches(/^[a-z0-9-]{3,60}$/),
  players(),
  text('from', { min: 1, max: 40, message: 'Diga de quem é' }),
  text('to', { min: 1, max: 40, message: 'Diga para quem é' }),
  optionalText('message', 240),
  text('buyerName', { min: 2, max: 80, message: 'Escreva o seu nome' }),
  email('buyerEmail'),
];

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados pedidos. Espere uns minutos e tente de novo.' },
});

const router = Router();

router.get('/salas', async (req, res) => {
  res.json({ rooms: await listRooms() });
});

router.get('/salas/:slug', async (req, res) => {
  res.json({ room: await roomBySlug(req.params.slug) });
});

router.get('/salas/:slug/calendario', async (req, res) => {
  const room = await roomBySlug(req.params.slug);
  res.json({ days: await calendar(room.id) });
});

router.get('/salas/:slug/horarios', validate([isoDate('data', query)], 'query'), async (req, res) => {
  const room = await roomBySlug(req.params.slug);
  res.json({ date: req.valid.query.data, slots: await availability(room.id, req.valid.query.data) });
});

router.post('/reservas', limiter, optionalAuth, validate(bookingRules), async (req, res) => {
  const booking = await createBooking(req.valid.body, req.user);
  res.status(201).json({ booking });
});

router.post('/vouchers', limiter, optionalAuth, validate(voucherRules), async (req, res) => {
  const voucher = await createVoucher(req.valid.body, req.user);
  res.status(201).json({ voucher });
});

router.get('/vouchers/:code', validate([param('code').isString().trim().toUpperCase().matches(/^CHAVE-[A-Z0-9]{4}$/).withMessage('Código inválido')], 'params'), async (req, res) => {
  res.json({ voucher: await checkVoucher(req.valid.params.code) });
});

router.get('/registo', validate([query('mes').optional().matches(/^\d{4}-\d{2}$/)], 'query'), async (req, res) => {
  res.json(await escapeLog({ month: req.valid.query.mes }));
});

export default router;
