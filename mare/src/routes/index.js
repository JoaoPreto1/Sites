import { Router } from 'express';
import auth from './auth.routes.js';
import properties from './properties.routes.js';
import experiences from './experiences.routes.js';
import contact from './contact.routes.js';
import { apiNotFound } from '../middleware/errors.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', auth);
router.use('/properties', properties);
router.use('/experiences', experiences);
router.use('/contact', contact);
router.use(apiNotFound);

export default router;
