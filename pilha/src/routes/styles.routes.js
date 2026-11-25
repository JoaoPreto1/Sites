import { Router } from 'express';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const cssDir = fileURLToPath(new URL('../../public/css', import.meta.url));
const BASE = ['base.css', 'components.css'];
let cache = null;

// Um só ficheiro de CSS: o site é pequeno e assim cada página faz um pedido só
async function bundle() {
  if (env.isProduction && cache) return cache;
  const pages = (await readdir(`${cssDir}/pages`).catch(() => [])).filter((f) => f.endsWith('.css')).sort();
  const files = [...BASE.map((f) => `${cssDir}/${f}`), ...pages.map((f) => `${cssDir}/pages/${f}`)];
  const css = (await Promise.all(files.map((f) => readFile(f, 'utf8').catch(() => '')))).join('\n');
  // Em produção tira comentários e espaços a mais (chega para este CSS, que não tem strings com espaços importantes)
  cache = env.isProduction
    ? css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};])\s*/g, '$1').replace(/;}/g, '}')
    : css;
  return cache;
}

const router = Router();

router.get('/css/app.css', async (req, res, next) => {
  try {
    const css = await bundle();
    res.type('text/css').set('Cache-Control', env.isProduction ? 'public, max-age=31536000, immutable' : 'no-cache').send(css);
  } catch (err) {
    next(err);
  }
});

export default router;
