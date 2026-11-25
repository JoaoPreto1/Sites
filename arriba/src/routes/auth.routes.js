import { Router } from 'express';
import { env } from '../config/env.js';
import { requireUser } from '../middleware/auth.js';
import { authLimiter } from '../middleware/limits.js';
import { validate } from '../middleware/validate.js';
import { users } from '../repositories/index.js';
import * as auth from '../services/auth.service.js';
import { HttpError } from '../utils/httpError.js';
import { body, email, password, text } from '../validation/common.js';
import { antiBot } from '../middleware/limits.js';

const REFRESH_COOKIE = 'arriba_refresh';

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'strict',
  secure: env.isProduction,
  path: '/api/auth',
  maxAge: env.jwt.refreshDays * 24 * 60 * 60 * 1000,
});

async function sendSession(res, user) {
  res.cookie(REFRESH_COOKIE, await auth.issueRefreshToken(user.id), cookieOptions());
  res.json({ user, accessToken: auth.signAccessToken(user) });
}

const loginRules = [email(), body('password', 'Escreva a palavra-passe').isString().notEmpty().isLength({ max: 128 })];
const passwordRules = [body('currentPassword', 'Escreva a palavra-passe atual').isString().notEmpty().isLength({ max: 128 }), password('newPassword')];

const router = Router();

router.post('/login', authLimiter, validate(loginRules), async (req, res) => {
  await sendSession(res, await auth.login(req.valid.body));
});

const registerRules = [
  text('name', { min: 2, max: 80, message: 'Escreva o nome (2 a 80 caracteres)' }),
  email(),
  body('phone', 'Escreva um telefone válido').optional({ values: 'falsy' }).isString().trim().matches(/^\+?[0-9 ]{9,18}$/),
  password('password'),
];

router.post('/registar', authLimiter, antiBot, validate(registerRules), async (req, res) => {
  res.status(201);
  await sendSession(res, await auth.register(req.valid.body));
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) throw new HttpError(401, 'Sem sessão ativa');
  const { user, refreshToken } = await auth.rotateRefreshToken(token);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  res.json({ user, accessToken: auth.signAccessToken(user) });
});

router.post('/logout', async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (token) await auth.revokeRefreshToken(token);
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(), maxAge: undefined });
  res.status(204).end();
});

router.get('/me', requireUser, async (req, res) => {
  res.json({ user: auth.publicUser(await users.findById(req.user.id)) });
});

router.patch('/me/password', requireUser, authLimiter, validate(passwordRules), async (req, res) => {
  await auth.changePassword(req.user.id, req.valid.body);
  res.json({ message: 'Palavra-passe alterada. As outras sessões foram terminadas.' });
});

export default router;
