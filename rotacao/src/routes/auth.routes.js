import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { body } from 'express-validator';
import * as controller from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { email, optionalText, password, postalCode, text } from '../validation/common.js';

const registerRules = [
  text('name', { min: 2, max: 80, message: 'Escreve o teu nome' }),
  email(),
  password('password'),
  optionalText('band', 60),
  optionalText('phone', 30),
];

const loginRules = [email(), body('password', 'Escreve a palavra-passe').isString().notEmpty()];

const profileRules = [
  body('name', 'Escreve o teu nome').optional().isString().trim().isLength({ min: 2, max: 80 }),
  optionalText('phone', 30),
  optionalText('band', 60),
  body('address', 'Escreve a morada').optional().isString().trim().isLength({ min: 5, max: 160 }),
  postalCode().optional(),
  body('city', 'Escreve a localidade').optional().isString().trim().isLength({ min: 2, max: 60 }),
];

const passwordRules = [body('currentPassword', 'Escreve a palavra-passe atual').isString().notEmpty(), password('newPassword')];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiadas tentativas. Espera uns minutos e tenta de novo.' },
});

const router = Router();

router.post('/register', limiter, validate(registerRules), controller.register);
router.post('/login', limiter, validate(loginRules), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

router.get('/me', requireAuth, controller.me);
router.patch('/me', requireAuth, validate(profileRules), controller.updateMe);
router.patch('/me/password', requireAuth, validate(passwordRules), controller.changePassword);

export default router;
