import { Router } from 'express';
import { z } from 'zod';
import * as owner from '../services/owner.service.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { isoDate } from '../validation/common.js';
import { today } from '../utils/dates.js';

const bookingsQuery = z.object({
  status: z.enum(['pendente', 'confirmada', 'cancelada', 'concluida']).optional(),
  propertyId: z.string().optional(),
});

const statusInput = z.object({
  status: z.enum(['confirmada', 'cancelada', 'concluida']),
});

const propertyInput = z
  .object({
    pricePerNight: z.coerce.number().min(20).max(5000),
    cleaningFee: z.coerce.number().min(0).max(1000),
    minNights: z.coerce.number().int().min(1).max(30),
    active: z.boolean(),
  })
  .partial();

const blockInput = z
  .object({
    propertyId: z.string().min(1),
    from: isoDate,
    to: isoDate,
    reason: z.string().trim().max(120).optional(),
  })
  .refine((b) => b.to > b.from, { message: 'A data final tem de ser depois da inicial', path: ['to'] })
  .refine((b) => b.to > today(), { message: 'O bloqueio tem de terminar no futuro', path: ['to'] });

const messageInput = z.object({ status: z.enum(['nova', 'lida', 'respondida']) });

const router = Router();
router.use(requireAuth, requireRole('proprietario', 'admin'));

router.get('/overview', async (req, res) => {
  res.json(await owner.overview(req.user));
});

router.get('/bookings', validate(bookingsQuery, 'query'), async (req, res) => {
  res.json({ bookings: await owner.listBookings(req.user, req.valid.query) });
});

router.patch('/bookings/:code', validate(statusInput), async (req, res) => {
  res.json({ booking: await owner.changeStatus(req.user, req.params.code, req.valid.body.status) });
});

router.get('/properties', async (req, res) => {
  res.json({ properties: await owner.ownedProperties(req.user) });
});

router.patch('/properties/:id', validate(propertyInput), async (req, res) => {
  res.json({ property: await owner.updateProperty(req.user, req.params.id, req.valid.body) });
});

router.get('/blocks', async (req, res) => {
  res.json({ blocks: await owner.listBlocks(req.user) });
});

router.post('/blocks', validate(blockInput), async (req, res) => {
  res.status(201).json({ block: await owner.createBlock(req.user, req.valid.body) });
});

router.delete('/blocks/:id', async (req, res) => {
  await owner.removeBlock(req.user, req.params.id);
  res.status(204).end();
});

router.get('/messages', async (req, res) => {
  res.json({ messages: await owner.listMessages() });
});

router.patch('/messages/:id', validate(messageInput), async (req, res) => {
  res.json({ message: await owner.updateMessage(req.params.id, req.valid.body.status) });
});

export default router;
