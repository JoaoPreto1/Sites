import { Router } from 'express';
import auth from './auth.routes.js';
import studio from './studio.routes.js';
import jobs from './jobs.routes.js';
import admin from './admin.routes.js';
import { apiNotFound } from '../middleware/errors.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', auth);
router.use('/', studio);
router.use('/trabalhos', jobs);
router.use('/admin', admin);
router.use(apiNotFound);

export default router;
