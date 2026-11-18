import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body, id } from '../validation/common.js';
import { MAX_PLAYERS, MIN_PLAYERS } from '../../public/js/shared/pricing.js';
import { cancelBooking, changePlayers, userBookings } from '../services/booking.service.js';
import { userVouchers } from '../services/voucher.service.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const [bookings, vouchers] = await Promise.all([userBookings(req.user), userVouchers(req.user)]);
  res.json({ bookings, vouchers });
});

router.post('/reservas/:id/cancelar', validate([id()], 'params'), async (req, res) => {
  res.json({ booking: await cancelBooking(req.user, req.valid.params.id) });
});

router.patch(
  '/reservas/:id',
  validate([id()], 'params'),
  validate([body('players', `Entre ${MIN_PLAYERS} e ${MAX_PLAYERS} pessoas`).isInt({ min: MIN_PLAYERS, max: MAX_PLAYERS }).toInt()]),
  async (req, res) => {
    res.json({ booking: await changePlayers(req.user, req.valid.params.id, req.valid.body.players) });
  },
);

export default router;
