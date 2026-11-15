import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { rooms as config } from '../config/shop.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as rooms from '../services/room.service.js';
import { body, id, isoDate, optionalText, query } from '../validation/common.js';
import { today } from '../utils/dates.js';

const bookingRules = [
  body('roomId', 'Escolhe uma sala').isString().isLength({ min: 1, max: 20 }),
  isoDate('date', body, 'Escolhe o dia'),
  body('start', 'Escolhe a hora').isInt({ min: config.opens, max: config.closes - 1 }).toInt(),
  body('hours', `Entre 1 e ${config.maxHours} horas seguidas`).isInt({ min: 1, max: config.maxHours }).toInt(),
  body('extras').optional().isArray({ max: 5 }),
  body('extras.*').isIn(Object.keys(config.extras)),
  optionalText('band', 60),
];

// A grelha é pública, mas quem tem sessão vê as suas horas marcadas a outra cor
function optionalUser(req, res, next) {
  const [type, token] = (req.get('authorization') ?? '').split(' ');
  if (type === 'Bearer' && token) {
    try {
      req.user = { id: jwt.verify(token, env.jwt.accessSecret).sub };
    } catch {}
  }
  next();
}

const router = Router();

router.get('/', optionalUser, validate([isoDate('data', query).optional()], 'query'), async (req, res) => {
  const date = req.valid.query.data ?? today();
  res.json({ date, days: rooms.bookableDays(), hours: rooms.HOURS, extras: config.extras, rooms: await rooms.day(date, req.user?.id) });
});

router.post('/reservas', requireAuth, validate(bookingRules), async (req, res) => {
  res.status(201).json({ booking: await rooms.book(req.user.id, req.valid.body) });
});

router.get('/reservas', requireAuth, async (req, res) => res.json({ bookings: await rooms.mine(req.user.id) }));

router.delete('/reservas/:id', requireAuth, validate([id()], 'params'), async (req, res) => {
  res.json({ booking: await rooms.cancel(req.user.id, req.params.id) });
});

export default router;
