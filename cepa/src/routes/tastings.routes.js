import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { shop } from '../config/shop.js';
import { cancel, mine, reserve, upcoming } from '../services/tasting.service.js';

const reserveRules = [body('people', `Entre 1 e ${shop.maxSeatsPerReservation} lugares`).isInt({ min: 1, max: shop.maxSeatsPerReservation }).toInt()];

const router = Router();

router.get('/', async (req, res) => res.json({ tastings: await upcoming() }));
router.get('/mine', requireAuth, async (req, res) => res.json({ reservations: await mine(req.user.id) }));

router.post('/:id/reservations', requireAuth, validate(reserveRules), async (req, res) => {
  res.status(201).json({ reservation: await reserve(req.user.id, req.params.id, req.valid.body.people) });
});

router.delete('/reservations/:id', requireAuth, async (req, res) => {
  await cancel(req.user.id, req.params.id);
  res.status(204).end();
});

export default router;
