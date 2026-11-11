import { Router } from 'express';
import { z } from 'zod';
import * as service from '../services/gallery.service.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const downloadInput = z.object({
  photoIds: z.array(z.string()).max(500).optional(),
});

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  res.json({ galleries: await service.listFor(req.user) });
});

router.get('/:id', async (req, res) => {
  const gallery = await service.findFor(req.user, req.params.id);
  res.json({ gallery: { ...gallery, expired: gallery.expiresAt < new Date().toISOString().slice(0, 10) } });
});

router.post('/:id/photos/:photoId/favorite', async (req, res) => {
  const favorites = await service.toggleFavorite(req.user, req.params.id, req.params.photoId);
  res.json({ favorites });
});

router.post('/:id/download', validate(downloadInput), async (req, res) => {
  const files = await service.registerDownload(req.user, req.params.id, req.valid.body.photoIds);
  res.json({ files });
});

export default router;
