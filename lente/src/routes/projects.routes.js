import { Router } from 'express';
import { z } from 'zod';
import { projects } from '../repositories/index.js';
import { categories } from '../data/seed.js';
import { validate } from '../middleware/validate.js';
import { notFound } from '../utils/httpError.js';

const listQuery = z.object({
  category: z.enum(categories).optional(),
  featured: z.enum(['true']).optional(),
});

const summary = ({ description, gallery, team, published, ...project }) => project;

const byNewest = (a, b) => b.year - a.year || a.title.localeCompare(b.title);

const router = Router();

router.get('/', validate(listQuery, 'query'), async (req, res) => {
  const { category, featured } = req.valid.query;
  const list = await projects.findAll((p) => p.published && (!category || p.category === category) && (!featured || p.featured));
  res.json({ categories, projects: list.sort(byNewest).map(summary) });
});

router.get('/:slug', async (req, res) => {
  const list = (await projects.findAll((p) => p.published)).sort(byNewest);
  const index = list.findIndex((p) => p.slug === req.params.slug);
  if (index === -1) throw notFound('Projeto');

  const next = list[(index + 1) % list.length];
  const { published, ...project } = list[index];
  res.json({ project, next: { slug: next.slug, title: next.title, category: next.category, cover: next.cover } });
});

export default router;
