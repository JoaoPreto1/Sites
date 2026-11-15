import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as wants from '../services/want.service.js';
import { body, grade, id, optionalText, text } from '../validation/common.js';

const wantRules = [
  text('artist', { min: 1, max: 80, message: 'Diz-nos o artista' }),
  text('title', { min: 1, max: 100, message: 'Diz-nos o disco' }),
  grade('minGrade'),
  body('maxPrice', 'Um valor entre 1 e 1000 €').isInt({ min: 1, max: 1000 }).toInt(),
  optionalText('note', 140),
];

const router = Router();

router.get('/', async (req, res) => res.json({ wants: await wants.wall() }));
router.get('/minha', requireAuth, async (req, res) => res.json({ wants: await wants.mine(req.user.id) }));
router.post('/', requireAuth, validate(wantRules), async (req, res) => {
  res.status(201).json({ want: await wants.create(req.user.id, req.valid.body) });
});
router.delete('/:id', requireAuth, validate([id()], 'params'), async (req, res) => {
  await wants.remove(req.user.id, req.params.id);
  res.status(204).end();
});

export default router;
