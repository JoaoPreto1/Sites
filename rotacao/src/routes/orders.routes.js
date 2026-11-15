import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as orders from '../services/order.service.js';
import { body, optionalText } from '../validation/common.js';

const itemRules = [
  body('items', 'O saco está vazio').isArray({ min: 1, max: 30 }),
  body('items.*.recordId').isString().isLength({ min: 1, max: 80 }),
  body('items.*.quantity').isInt({ min: 1, max: 10 }).toInt(),
  body('method').optional().isIn(['envio', 'loja']),
];

const isShipping = (value, { req }) => req.body.method === 'envio';

const orderRules = [
  ...itemRules,
  body('method', 'Escolhe como queres receber').isIn(['envio', 'loja']),
  body('address', 'Escreve a morada').if(isShipping).isString().trim().isLength({ min: 5, max: 160 }),
  body('postalCode', 'Código postal no formato 0000-000').if(isShipping).trim().matches(/^\d{4}-\d{3}$/),
  body('city', 'Escreve a localidade').if(isShipping).isString().trim().isLength({ min: 2, max: 60 }),
  optionalText('notes', 300),
];

const router = Router();

router.post('/orcamento', validate(itemRules), async (req, res) => {
  res.json(await orders.quote(req.valid.body.items, req.valid.body.method));
});

router.post('/', requireAuth, validate(orderRules), async (req, res) => {
  res.status(201).json({ order: await orders.create(req.user.id, req.valid.body) });
});

router.get('/', requireAuth, async (req, res) => res.json({ orders: await orders.mine(req.user.id) }));

export default router;
