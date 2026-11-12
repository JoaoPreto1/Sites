import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { properties } from '../repositories/index.js';
import { absolute, renderHead } from '../seo/head.js';
import { propertyPage, staticPages } from '../seo/pages.js';
import { icon } from '../../public/js/icons.js';

const publicDir = fileURLToPath(new URL('../../public', import.meta.url));
const templates = new Map();

async function template(file) {
  if (!templates.has(file) || !env.isProduction) {
    templates.set(file, await readFile(`${publicDir}/${file}.html`, 'utf8'));
  }
  return templates.get(file);
}

// Os dados vão numa tag JSON (não é executada) para a página não ter de os pedir outra vez à API
const initialData = (data) =>
  `<script type="application/json" id="initial-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

// Ícones desenhados já no HTML: evita que apareçam depois e empurrem o conteúdo
const withIcons = (html) =>
  html.replace(/<[a-z0-9]+\b[^>]*\sdata-icon="([a-z]+)"(?:\s+data-icon-size="(\d+)")?[^>]*>/g, (tag, name, size) => tag + icon(name, Number(size) || 24));

async function send(res, page, { status = 200, data } = {}) {
  const html = withIcons(await template(page.file))
    .replace('<!--seo-->', renderHead({ ...page, schema: typeof page.schema === 'function' ? page.schema() : page.schema }))
    .replace('<!--data-->', data ? initialData(data) : '');
  res.status(status).type('html').set('Cache-Control', 'no-cache').send(html);
}

export async function notFoundPage(req, res) {
  await send(res, { file: '404', title: 'Página não encontrada', description: 'Esta página não existe.', noindex: true, path: req.path }, { status: 404 });
}

const router = Router();

for (const [path, page] of Object.entries(staticPages)) {
  router.get(path, (req, res) => send(res, { ...page, path }));
}

router.get('/alojamentos/:slug', async (req, res) => {
  const property = await properties.findOne((p) => p.slug === req.params.slug && p.active);
  if (!property) return notFoundPage(req, res);

  const { ownerId, active, ...publicData } = property;
  await send(res, propertyPage(property), { data: { property: { ...publicData, reviewsCount: property.reviews.length } } });
});

const PRIVATE_PATHS = ['/conta$', '/painel$', '/reserva', '/entrar'];

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    ['User-agent: *', 'Allow: /', 'Disallow: /api/', ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`), '', `Sitemap: ${absolute('/sitemap.xml')}`, ''].join('\n'),
  );
});

router.get('/sitemap.xml', async (req, res) => {
  const list = await properties.findAll((p) => p.active);
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ['/', '1.0', 'weekly'],
    ['/alojamentos', '0.9', 'daily'],
    ...list.map((p) => [`/alojamentos/${p.slug}`, '0.8', 'daily']),
    ['/experiencias', '0.6', 'monthly'],
    ['/regiao', '0.6', 'monthly'],
    ['/contactos', '0.4', 'yearly'],
  ];

  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(([path, priority, freq]) => `  <url><loc>${absolute(path)}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`)
      .join('\n')}\n</urlset>\n`,
  );
});

export default router;
