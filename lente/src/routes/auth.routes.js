import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import * as controller from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const loginSchema = z.object({
  email: z.email('Escreva um email válido'),
  password: z.string().min(1, 'Escreva a palavra-passe'),
});

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Escreva o seu nome').max(80).optional(),
  phone: z.string().trim().max(30).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'A palavra-passe precisa de pelo menos 8 caracteres').max(100),
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiadas tentativas. Espere uns minutos e tente de novo.' },
});

const router = Router();

router.post('/login', limiter, validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

router.get('/me', requireAuth, controller.me);
router.patch('/me', requireAuth, validate(profileSchema), controller.updateMe);
router.patch('/me/password', requireAuth, validate(passwordSchema), controller.changePassword);

export default router;
