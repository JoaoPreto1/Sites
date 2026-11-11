import { Router } from 'express';
import * as controller from '../controllers/bookings.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { bookingInput, checkinInput, extraInput, stayInput } from '../validation/booking.js';

const router = Router();

router.post('/quote', validate(stayInput), controller.quote);

router.use(requireAuth);
router.post('/', validate(bookingInput), controller.create);
router.get('/mine', controller.mine);
router.get('/:code', controller.show);
router.post('/:code/cancel', controller.cancel);
router.post('/:code/checkin', validate(checkinInput), controller.checkin);
router.post('/:code/extras', validate(extraInput), controller.addExtra);

export default router;
