import { Router } from 'express';
import auth from './auth.routes.js';
import account from './account.routes.js';
import publicRoutes from './public.routes.js';
import staff from './staff.routes.js';
import { apiNotFound } from '../middleware/errors.js';

const router = Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', auth);
router.use('/conta', account);
router.use('/gestao', staff);
router.use('/', publicRoutes);
router.use(apiNotFound);

export default router;
