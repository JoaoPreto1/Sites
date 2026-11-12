import { Router } from 'express';
import { query } from 'express-validator';
import { categories } from '../data/seed.js';
import { validate } from '../middleware/validate.js';
import { findWithNext, listPublished } from '../services/project.service.js';
import { notFound } from '../utils/httpError.js';

const listQuery = [
  query('category', 'Categoria inválida').optional().isIn(categories),
  query('featured', 'Valor inválido').optional().isIn(['true']),
];

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
