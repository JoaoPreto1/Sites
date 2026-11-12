import { Router } from 'express';
import auth from './auth.routes.js';
import wines from './wines.routes.js';
import orders from './orders.routes.js';
import tastings from './tastings.routes.js';
import club from './club.routes.js';
import newsletter from './newsletter.routes.js';
import admin from './admin.routes.js';
import { apiNotFound } from '../middleware/errors.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', auth);
router.use('/', wines);
router.use('/orders', orders);
router.use('/tastings', tastings);
router.use('/club', club);
router.use('/newsletter', newsletter);
router.use('/admin', admin);
router.use(apiNotFound);

export default router;
