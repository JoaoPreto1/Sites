import { Router } from 'express';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const cssDir = fileURLToPath(new URL('../../public/css', import.meta.url));
const BASE = ['base.css', 'os.css', 'components.css'];
let cache = null;

// Todas as janelas podem abrir em qualquer página, por isso o CSS vai todo num só ficheiro
async function bundle() {
  if (env.isProduction && cache) return cache;
  const pages = (await readdir(`${cssDir}/pages`)).filter((f) => f.endsWith('.css')).sort();
  const files = [...BASE.map((f) => `${cssDir}/${f}`), ...pages.map((f) => `${cssDir}/pages/${f}`)];
  cache = (await Promise.all(files.map((f) => readFile(f, 'utf8')))).join('\n');
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
