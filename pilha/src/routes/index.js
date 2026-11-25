import { Router } from 'express';
import auth from './auth.routes.js';
import client from './client.routes.js';
import publicRoutes from './public.routes.js';
import studio from './studio.routes.js';
import { apiNotFound } from '../middleware/errors.js';

const router = Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', auth);
router.use('/cliente', client);
router.use('/estudio', studio);
router.use('/', publicRoutes);
router.use(apiNotFound);

export default router;
