import { Router } from 'express';
import { env } from '../config/env.js';
import { requireUser } from '../middleware/auth.js';
import { antiBot, authLimiter } from '../middleware/limits.js';
import { validate } from '../middleware/validate.js';
import { users } from '../repositories/index.js';
import * as auth from '../services/auth.service.js';
import { HttpError } from '../utils/httpError.js';
import { body, email, password, text } from '../validation/common.js';

const REFRESH_COOKIE = 'amparo_refresh';

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'strict',
  secure: env.isProduction,
  path: '/api/auth',
  maxAge: env.jwt.refreshDays * 24 * 60 * 60 * 1000,
});

async function sendSession(res, user, status = 200) {
  res.cookie(REFRESH_COOKIE, await auth.issueRefreshToken(user.id), cookieOptions());
  res.status(status).json({ user, accessToken: auth.signAccessToken(user) });
}

const registerRules = [
  text('name', { min: 2, max: 80, message: 'Escreva o seu nome' }),
  email(),
  password('password'),
  body('accept', 'Precisa de aceitar as condições e a política de privacidade').equals('true'),
];
const loginRules = [email(), body('password', 'Escreva a palavra-passe').isString().notEmpty().isLength({ max: 128 })];
const profileRules = [text('name', { min: 2, max: 80, message: 'Escreva o seu nome' }), email()];
const passwordRules = [body('currentPassword', 'Escreva a palavra-passe atual').isString().notEmpty(), password('newPassword')];

const router = Router();

router.post('/register', authLimiter, antiBot, validate(registerRules), async (req, res) => {
  const { name, email: mail, password: pass } = req.valid.body;
  await sendSession(res, await auth.register({ name, email: mail, password: pass }), 201);
});

router.post('/login', authLimiter, validate(loginRules), async (req, res) => {
  await sendSession(res, await auth.login(req.valid.body));
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
  const user = await users.findById(req.user.id);
  if (!user || user.deletedAt) throw new HttpError(404, 'Conta não encontrada');
  res.json({ user: auth.publicUser(user) });
});

router.patch('/me', requireUser, validate(profileRules), async (req, res) => {
  const { name, email: mail } = req.valid.body;
  const normalized = mail.toLowerCase();
  if (await users.findOne((u) => u.email === normalized && u.id !== req.user.id)) throw new HttpError(409, 'Já existe uma conta com este email');
  res.json({ user: auth.publicUser(await users.update(req.user.id, { name, email: normalized })) });
});

router.patch('/me/password', requireUser, validate(passwordRules), async (req, res) => {
  await auth.changePassword(req.user.id, req.valid.body);
  res.json({ message: 'Palavra-passe alterada. As outras sessões foram terminadas.' });
});

export default router;
