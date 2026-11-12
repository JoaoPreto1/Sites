import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { DISHES, REGIONS, TYPES } from '../data/seed.js';
import { catalog, listWines, pairing, producerList, wineDetail } from '../services/catalog.service.js';

const slugs = (list) => list.map((item) => item.slug);

const listQuery = [
  query('tipo', 'Tipo de vinho inválido').optional().isIn(slugs(TYPES)),
  query('regiao', 'Região inválida').optional().isIn(slugs(REGIONS)),
  query('prato', 'Prato inválido').optional().isIn(slugs(DISHES)),
  query('ate', 'Preço máximo inválido').optional().isFloat({ min: 1, max: 1000 }).toFloat(),
  query('q').optional().isString().trim().isLength({ max: 60 }),
  query('ordem', 'Ordem inválida').optional().isIn(['carta', 'preco-asc', 'preco-desc', 'antigos']),
];

const pairingQuery = [
  query('prato', 'Escolha um prato').isIn(slugs(DISHES)),
  query('pessoas', 'Entre 1 e 20 pessoas').optional().isInt({ min: 1, max: 20 }).toInt(),
  query('orcamento', 'Orçamento inválido').optional().isFloat({ min: 5, max: 500 }).toFloat(),
];

const router = Router();

router.get('/catalog', async (req, res) => res.json(await catalog()));
router.get('/producers', async (req, res) => res.json({ producers: await producerList() }));

router.get('/wines', validate(listQuery, 'query'), async (req, res) => {
  res.json({ wines: await listWines(req.valid.query) });
});

router.get('/wines/pairing', validate(pairingQuery, 'query'), async (req, res) => {
  res.json(await pairing(req.valid.query));
});

router.get('/wines/:slug', async (req, res) => res.json(await wineDetail(req.params.slug)));

export default router;
