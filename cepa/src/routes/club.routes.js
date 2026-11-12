import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { CLUB_PLANS } from '../data/seed.js';
import { PREFERENCES, SUBSCRIPTION_STATUSES, mine, overview, subscribe, update } from '../services/club.service.js';

const plans = CLUB_PLANS.map((p) => p.slug);

const subscribeRules = [
  body('plan', 'Escolha um plano').isIn(plans),
  body('preference', 'Escolha o que prefere receber').default('misto').isIn(PREFERENCES),
];

const updateRules = [
  body('plan', 'Plano inválido').optional().isIn(plans),
  body('preference', 'Preferência inválida').optional().isIn(PREFERENCES),
  body('status', 'Estado inválido').optional().isIn([...SUBSCRIPTION_STATUSES, 'cancelada']),
];

const router = Router();

router.get('/', async (req, res) => res.json(await overview()));
router.get('/me', requireAuth, async (req, res) => res.json({ subscription: await mine(req.user.id) }));

router.post('/', requireAuth, validate(subscribeRules), async (req, res) => {
  res.status(201).json({ subscription: await subscribe(req.user.id, req.valid.body) });
});

router.patch('/me', requireAuth, validate(updateRules), async (req, res) => {
  const subscription = await update(req.user.id, req.valid.body);
  res.json({ subscription: subscription.status === 'cancelada' ? null : subscription });
});

export default router;
