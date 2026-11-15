import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { offers, records, wants as wantsRepo } from '../repositories/index.js';
import { publicRecord } from '../services/catalog.service.js';
import * as orders from '../services/order.service.js';
import * as rooms from '../services/room.service.js';
import * as wants from '../services/want.service.js';
import { today } from '../utils/dates.js';
import { notFound } from '../utils/httpError.js';
import { body, id, isoDate, query } from '../validation/common.js';

const router = Router();
router.use(requireAuth, requireRole('staff', 'admin'));

router.get('/resumo', async (req, res) => {
  const day = today();
  const [allOrders, dayBookings, open, found, newOffers, stock] = await Promise.all([
    orders.all(),
    rooms.forDay(day),
    wantsRepo.findAll((w) => w.status === 'aberto'),
    wantsRepo.findAll((w) => w.status === 'encontrado'),
    offers.findAll((o) => o.status === 'nova'),
    records.findAll((r) => r.stock <= 1),
  ]);
  res.json({
    date: day,
    toShip: allOrders.filter((o) => o.status === 'paga'),
    bookings: dayBookings.filter((b) => b.status === 'confirmada'),
    wantsOpen: open.length,
    wantsFound: found.length,
    offers: newOffers,
    lowStock: stock.map(publicRecord),
  });
});

router.get('/encomendas', async (req, res) => res.json({ orders: await orders.all() }));

router.patch('/encomendas/:id', validate([id(), body('status').isIn(orders.STATUSES)], 'body'), async (req, res) => {
  res.json({ order: await orders.setStatus(req.params.id, req.valid.body.status) });
});

router.get('/discos', async (req, res) => {
  const list = await records.findAll();
  res.json({ records: list.map(publicRecord).sort((a, b) => a.artist.localeCompare(b.artist, 'pt')) });
});

const recordRules = [
  body('price', 'Preço entre 1 e 999 €').optional().isFloat({ min: 1, max: 999 }).toFloat(),
  body('stock', 'Stock entre 0 e 99').optional().isInt({ min: 0, max: 99 }).toInt(),
  body('featured').optional().isBoolean().toBoolean(),
];

router.patch('/discos/:id', validate(recordRules), async (req, res) => {
  const record = await records.update(req.params.id, req.valid.body);
  if (!record) throw notFound('Disco');
  res.json({ record: publicRecord(record) });
});

router.get('/salas', validate([isoDate('data', query).optional()], 'query'), async (req, res) => {
  const date = req.valid.query.data ?? today();
  res.json({ date, days: rooms.bookableDays(), bookings: await rooms.forDay(date) });
});

router.delete('/salas/reservas/:id', validate([id()], 'params'), async (req, res) => {
  res.json({ booking: await rooms.cancel(null, req.params.id, { force: true }) });
});

router.get('/procura', async (req, res) => {
  const [list, stock] = await Promise.all([wants.all(), records.findAll((r) => r.stock > 0)]);
  res.json({ wants: list, records: stock.map((r) => ({ id: r.id, artist: r.artist, title: r.title })) });
});

router.patch('/procura/:id', validate([body('status').isIn(['encontrado', 'fechado']), body('recordId').optional().isString().isLength({ max: 80 })]), async (req, res) => {
  const { status, recordId } = req.valid.body;
  res.json({ want: status === 'encontrado' ? await wants.markFound(req.params.id, recordId) : await wants.close(req.params.id) });
});

router.get('/avaliacoes', async (req, res) => {
  const list = await offers.findAll();
  res.json({ offers: list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

router.patch('/avaliacoes/:id', validate([body('status').isIn(['nova', 'marcada', 'fechada']), isoDate('date', body).optional()]), async (req, res) => {
  const offer = await offers.update(req.params.id, req.valid.body);
  if (!offer) throw notFound('Avaliação');
  res.json({ offer });
});

export default router;
