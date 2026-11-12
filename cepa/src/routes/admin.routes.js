import { Router } from 'express';
import { body, query } from 'express-validator';
import { orders, users, wines } from '../repositories/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listWines } from '../services/catalog.service.js';
import { ORDER_STATUSES, changeStatus } from '../services/order.service.js';
import { cancel, guestList } from '../services/tasting.service.js';
import { members } from '../services/club.service.js';
import { publicUser } from '../services/auth.service.js';
import { notFound } from '../utils/httpError.js';
import { round } from '../utils/money.js';

const ordersQuery = [query('estado', 'Estado inválido').optional().isIn(ORDER_STATUSES)];
const statusRules = [body('status', 'Estado inválido').isIn(ORDER_STATUSES)];

const wineRules = [
  body('price', 'Preço entre 3 € e 1000 €').optional().isFloat({ min: 3, max: 1000 }).toFloat(),
  body('stock', 'Stock entre 0 e 999').optional().isInt({ min: 0, max: 999 }).toInt(),
  body('featured', 'Valor inválido').optional().isBoolean({ strict: true }).toBoolean(true),
  body('staffNote').optional().isString().trim().isLength({ max: 200 }),
];

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/overview', async (req, res) => {
  const [allOrders, allWines, club, tastings] = await Promise.all([orders.findAll(), wines.findAll(), members(), guestList()]);
  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = allOrders.filter((o) => o.createdAt.startsWith(month) && o.status !== 'cancelada');

  res.json({
    open: allOrders.filter((o) => ['recebida', 'em preparação'].includes(o.status)).length,
    monthTotal: round(thisMonth.reduce((sum, o) => sum + o.total, 0)),
    monthOrders: thisMonth.length,
    lowStock: allWines.filter((w) => w.stock <= 6).map(({ id, name, year, stock }) => ({ id, name, year, stock })),
    members: { total: club.length, paused: club.filter((m) => m.status === 'em pausa').length },
    nextTasting: tastings[0] ? { title: tastings[0].title, date: tastings[0].date, taken: tastings[0].taken, seats: tastings[0].seats } : null,
  });
});

router.get('/orders', validate(ordersQuery, 'query'), async (req, res) => {
  const [list, people] = await Promise.all([orders.findAll((o) => !req.valid.query.estado || o.status === req.valid.query.estado), users.findAll()]);
  const byId = Object.fromEntries(people.map((u) => [u.id, publicUser(u)]));
  res.json({
    statuses: ORDER_STATUSES,
    orders: list
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((o) => ({ ...o, customer: { name: byId[o.userId]?.name, email: byId[o.userId]?.email } })),
  });
});

router.patch('/orders/:id', validate(statusRules), async (req, res) => {
  res.json({ order: await changeStatus(req.params.id, req.valid.body.status) });
});

router.get('/wines', async (req, res) => res.json({ wines: await listWines() }));

router.patch('/wines/:id', validate(wineRules), async (req, res) => {
  const wine = await wines.update(req.params.id, req.valid.body);
  if (!wine) throw notFound('Vinho');
  res.json({ wine });
});

router.get('/tastings', async (req, res) => res.json({ tastings: await guestList() }));

router.delete('/reservations/:id', async (req, res) => {
  await cancel(req.user.id, req.params.id, { isAdmin: true });
  res.status(204).end();
});

router.get('/members', async (req, res) => res.json({ members: await members() }));

export default router;
