import { Router } from 'express';
import auth from './auth.routes.js';
import publicRoutes from './public.routes.js';
import account from './account.routes.js';
import admin from './admin.routes.js';
import { apiNotFound } from '../middleware/errors.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', auth);
router.use('/balcao', account);
router.use('/admin', admin);
router.use('/', publicRoutes);
router.use(apiNotFound);

export default router;
