import { Router } from 'express';
import { experiences } from '../repositories/index.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json({ experiences: await experiences.findAll() });
});

export default router;
