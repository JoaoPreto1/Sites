import { Router } from 'express';
import { CRATES } from '../data/records.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { catalog, fullTrack, library, listRecords, recordDetail } from '../services/catalog.service.js';
import { grade, param, query } from '../validation/common.js';

const listRules = [
  query('caixote').optional().isIn(CRATES.map((c) => c.slug)),
  grade('estado', query).optional(),
  query('ate').optional().isInt({ min: 1, max: 500 }).toInt(),
  query('q').optional().isString().trim().isLength({ max: 60 }),
  query('ordem').optional().isIn(['chegada', 'preco', 'preco-desc', 'ano', 'artista']),
];

const router = Router();

router.get('/discos', validate(listRules, 'query'), async (req, res) => {
  res.json({ records: await listRecords(req.valid.query) });
});

router.get('/discos/catalogo', async (req, res) => res.json(await catalog()));

router.get('/discos/:slug', async (req, res) => res.json(await recordDetail(req.params.slug)));

// A tua discoteca: os discos que já compraste, com as faixas completas quando a loja as tiver
router.get('/discoteca', requireAuth, async (req, res) => res.json({ records: await library(req.user.id) }));

router.get(
  '/discos/:slug/faixas/:index/completa',
  requireAuth,
  validate([param('index').isInt({ min: 0, max: 60 }).toInt()], 'params'),
  async (req, res) => {
    const file = await fullTrack(req.user.id, req.params.slug, req.valid.params.index);
    res.set('Cache-Control', 'private, no-store').redirect(file);
  },
);

export default router;
