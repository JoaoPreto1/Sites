import { Router } from 'express';
import auth from './auth.routes.js';
import records from './records.routes.js';
import orders from './orders.routes.js';
import rooms from './rooms.routes.js';
import wants from './wants.routes.js';
import offers from './offers.routes.js';
import admin from './admin.routes.js';
import { apiNotFound } from '../middleware/errors.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', auth);
router.use('/', records);
router.use('/encomendas', orders);
router.use('/salas', rooms);
router.use('/procura', wants);
router.use('/', offers);
router.use('/admin', admin);
router.use(apiNotFound);

export default router;
