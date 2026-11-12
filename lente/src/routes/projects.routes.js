import { Router } from 'express';
import { z } from 'zod';
import { categories } from '../data/seed.js';
import { validate } from '../middleware/validate.js';
import { findWithNext, listPublished } from '../services/project.service.js';
import { notFound } from '../utils/httpError.js';

const listQuery = z.object({
  category: z.enum(categories).optional(),
  featured: z.enum(['true']).optional(),
});

const router = Router();

router.get('/', validate(listQuery, 'query'), async (req, res) => {
  res.json({ categories, projects: await listPublished(req.valid.query) });
});

router.get('/:slug', async (req, res) => {
  const result = await findWithNext(req.params.slug);
  if (!result) throw notFound('Projeto');
  res.json(result);
});

export default router;
