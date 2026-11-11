import { Router } from 'express';
import auth from './auth.routes.js';
import projects from './projects.routes.js';
import quotes from './quotes.routes.js';
import newsletter from './newsletter.routes.js';
import galleries from './galleries.routes.js';
import admin from './admin.routes.js';
import { services } from '../repositories/index.js';
import { apiNotFound } from '../middleware/errors.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.get('/services', async (req, res) => res.json({ services: await services.findAll() }));
router.use('/auth', auth);
router.use('/projects', projects);
router.use('/quotes', quotes);
router.use('/newsletter', newsletter);
router.use('/galleries', galleries);
router.use('/admin', admin);
router.use(apiNotFound);

export default router;
