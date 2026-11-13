import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const cssDir = fileURLToPath(new URL('../../public/css', import.meta.url));
const BASE = ['base', 'layout', 'components'];
const PAGE = /^[a-z-]+$/;
const cache = new Map();

// Junta o CSS comum e o da página num só ficheiro: um pedido a bloquear a página em vez de quatro
async function bundle(pages) {
  const key = pages.join(',');
  if (env.isProduction && cache.has(key)) return cache.get(key);
  const files = [...BASE.map((f) => `${cssDir}/${f}.css`), ...pages.map((p) => `${cssDir}/pages/${p}.css`)];
  const css = (await Promise.all(files.map((f) => readFile(f, 'utf8')))).join('\n');
  cache.set(key, css);
  return css;
}

const router = Router();

router.get('/css/app.css', async (req, res, next) => {
  const pages = String(req.query.p ?? '')
    .split(',')
    .filter((p) => PAGE.test(p));
  try {
    const css = await bundle(pages);
    res.type('text/css').set('Cache-Control', env.isProduction ? 'public, max-age=31536000, immutable' : 'no-cache').send(css);
  } catch {
    next();
  }
});

export default router;
