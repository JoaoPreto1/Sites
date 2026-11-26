import { Router } from 'express';
import { body, query } from 'express-validator';
import { isIsoDay } from '../utils/dates.js';
import { requireRole, requireUser } from '../middleware/auth.js';
import { bookingLimiter, writeLimiter } from '../middleware/limits.js';
import { validate } from '../middleware/validate.js';
import { REQUEST_KEYS, ROOM_TYPES, STATUS_KEYS } from '../config/site.js';
import * as booking from '../services/booking.service.js';
import { apiNotFound } from '../middleware/errors.js';
import auth from './auth.routes.js';
import { arrivalTime, day, notes, stayBody, stayQuery, toStay } from '../validation/stay.js';

const router = Router();
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', auth);

// ---------- público ----------
router.get('/disponibilidade', validate(stayQuery, 'query'), async (req, res) => {
  res.json(await booking.availability(toStay(req.valid.query)));
});

router.get(
  '/calendario',
  validate(
    [
      query('desde', 'Data inválida').optional().isString().custom(isIsoDay),
      query('dias', 'Entre 1 e 120 dias').optional().isInt({ min: 1, max: 120 }).toInt(),
      query('hospedes', 'Entre 1 e 3 hóspedes').optional().isInt({ min: 1, max: 3 }).toInt(),
      query('tipo', 'Tipo de quarto inválido').optional().isIn(ROOM_TYPES.map((t) => t.slug)),
    ],
    'query',
  ),
  async (req, res) => {
    const q = req.valid.query;
    res.json({ nights: await booking.nightsCalendar({ from: q.desde, days: q.dias, guests: q.hospedes, type: q.tipo }) });
  },
);

router.get('/ementa', async (req, res) => {
  res.json({ menu: await booking.currentMenu() });
});

// ---------- hóspede ----------
const guest = Router();
guest.use(requireUser, requireRole('hospede'));

guest.get('/reservas', async (req, res) => {
  res.json({ reservations: await booking.guestReservations(req.user.id) });
});

guest.post('/reservas', bookingLimiter, validate([...stayBody, arrivalTime(), notes()]), async (req, res) => {
  res.status(201).json({ reservation: await booking.createReservation(req.user, req.valid.body) });
});

guest.patch('/reservas/:id', writeLimiter, validate([arrivalTime(), notes()]), async (req, res) => {
  res.json({ reservation: await booking.updateByGuest(req.user, req.params.id, req.valid.body) });
});

guest.post('/reservas/:id/cancelar', writeLimiter, async (req, res) => {
  res.json({ reservation: await booking.cancelByGuest(req.user, req.params.id) });
});

guest.post(
  '/reservas/:id/pedidos',
  writeLimiter,
  validate([body('kind', 'Escolha o pedido').isIn(REQUEST_KEYS), day(body, 'date', 'dia do pedido'), notes()]),
  async (req, res) => {
    res.status(201).json({ request: await booking.addRequest(req.user, req.params.id, req.valid.body) });
  },
);

// ---------- receção ----------
const desk = Router();
desk.use(requireUser, requireRole('rececao'));

desk.get('/hoje', async (req, res) => {
  res.json(await booking.dayOverview());
});

desk.get('/reservas', async (req, res) => {
  const status = STATUS_KEYS.includes(req.query.estado) ? req.query.estado : undefined;
  res.json({ reservations: await booking.listReservations({ status }) });
});

desk.patch('/reservas/:id/estado', writeLimiter, validate([body('status', 'Estado inválido').isIn(STATUS_KEYS)]), async (req, res) => {
  res.json({ reservation: await booking.setStatus(req.params.id, req.valid.body.status) });
});

desk.get('/pedidos', async (req, res) => {
  res.json({ requests: await booking.allRequests() });
});

desk.patch('/pedidos/:id', writeLimiter, validate([body('status', 'Estado inválido').isIn(['pendente', 'feito'])]), async (req, res) => {
  res.json({ request: await booking.setRequestStatus(req.params.id, req.valid.body.status) });
});

desk.get('/ementa', async (req, res) => {
  res.json({ menu: await booking.currentMenu() });
});

desk.put(
  '/ementa',
  writeLimiter,
  validate([
    body('items', 'A ementa tem entre 1 e 8 pratos').isArray({ min: 1, max: 8 }),
    body('items.*.name', 'Escreva o nome do prato').isString().trim().isLength({ min: 2, max: 60 }),
    body('items.*.detail', 'No máximo 90 caracteres').optional({ values: 'falsy' }).isString().trim().isLength({ max: 90 }),
    body('items.*.price', 'Preço entre 1 e 200 €').isInt({ min: 1, max: 200 }).toInt(),
  ]),
  async (req, res) => {
    const items = req.valid.body.items.map(({ name, detail = '', price }) => ({ name, detail, price }));
    res.json({ menu: await booking.saveTodayMenu(items) });
  },
);

desk.get('/precos', async (req, res) => {
  const table = await booking.priceTable();
  res.json({ prices: ROOM_TYPES.map((t) => ({ slug: t.slug, name: t.name, rooms: t.rooms, price: table[t.slug] })) });
});

desk.patch('/precos/:slug', writeLimiter, validate([body('price', 'Preço entre 40 e 900 € por noite').isInt({ min: 40, max: 900 }).toInt()]), async (req, res) => {
  res.json({ price: await booking.setPrice(req.params.slug, req.valid.body.price) });
});

router.use('/hospede', guest);
router.use('/rececao', desk);
router.use(apiNotFound);

export default router;
