import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { shop } from '../config/shop.js';
import { cancelOwn, createOrder, listFor, quote } from '../services/order.service.js';

const itemRules = [
  body('items', 'O cesto está vazio').isArray({ min: 1, max: 40 }),
  body('items.*.wineId', 'Vinho inválido').isString().notEmpty(),
  body('items.*.quantity', `Entre 1 e ${shop.maxPerWine} garrafas por vinho`).isInt({ min: 1, max: shop.maxPerWine }).toInt(),
];

const whenShipping = (field, message) => body(field, message).if(body('delivery.method').equals('envio'));

const orderRules = [
  ...itemRules,
  body('delivery.method', 'Escolha envio ou levantamento na loja').isIn(['envio', 'loja']),
  whenShipping('delivery.address', 'Escreva a morada de entrega').isString().trim().isLength({ min: 5, max: 160 }),
  whenShipping('delivery.postalCode', 'Código postal no formato 0000-000').isString().trim().matches(/^\d{4}-\d{3}$/),
  whenShipping('delivery.city', 'Escreva a localidade').isString().trim().isLength({ min: 2, max: 60 }),
  body('delivery.notes').optional().isString().trim().isLength({ max: 300 }),
  body('confirmAge', 'Confirme que tem mais de 18 anos').custom((value) => value === true),
];

const quoteRules = [...itemRules, body('method').optional().isIn(['envio', 'loja'])];

const router = Router();

// O orçamento do cesto pode ser pedido sem conta; o desconto de sócio aparece se houver sessão
router.post('/quote', validate(quoteRules), async (req, res, next) => {
  const header = req.get('authorization');
  if (!header) return res.json(await quote(req.valid.body.items, { method: req.valid.body.method }));
  requireAuth(req, res, async (err) => {
    if (err) return next(err);
    res.json(await quote(req.valid.body.items, { userId: req.user.id, method: req.valid.body.method }));
  });
});

router.use(requireAuth);

router.get('/', async (req, res) => res.json({ orders: await listFor(req.user.id) }));

router.post('/', validate(orderRules), async (req, res) => {
  const { items, delivery } = req.valid.body;
  const order = await createOrder(req.user.id, { items, delivery: delivery.method === 'loja' ? { method: 'loja', notes: delivery.notes } : delivery });
  res.status(201).json({ order });
});

router.post('/:id/cancel', async (req, res) => res.json({ order: await cancelOwn(req.user.id, req.params.id) }));

export default router;
