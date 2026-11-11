import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { stayInput } from '../validation/booking.js';
import { buildQuote } from '../services/booking.service.js';

const router = Router();

router.post('/quote', validate(stayInput), async (req, res) => {
  const { available, quote } = await buildQuote(req.valid.body);
  res.json({ available, quote });
});

export default router;
