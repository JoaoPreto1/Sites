import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { body } from 'express-validator';
import * as controller from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { email, optionalText, password } from '../validation/common.js';

const loginRules = [email(), body('password', 'Escreva a palavra-passe').isString().notEmpty()];

const profileRules = [
  body('name', 'Escreva o seu nome').optional().isString().trim().isLength({ min: 2, max: 80 }),
  optionalText('phone', 30),
];

const passwordRules = [body('currentPassword', 'Escreva a palavra-passe atual').isString().notEmpty(), password('newPassword')];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiadas tentativas. Espere uns minutos e tente de novo.' },
});

const router = Router();

router.post('/login', limiter, validate(loginRules), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

router.get('/me', requireAuth, controller.me);
router.patch('/me', requireAuth, validate(profileRules), controller.updateMe);
router.patch('/me/password', requireAuth, validate(passwordRules), controller.changePassword);

export default router;
