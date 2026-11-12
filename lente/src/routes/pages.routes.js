import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { categories } from '../data/seed.js';
import { services } from '../repositories/index.js';
import { findWithNext, listPublished } from '../services/project.service.js';
import { absolute, renderHead } from '../seo/head.js';
import { projectPage, staticPages } from '../seo/pages.js';
import { icon } from '../../public/js/icons.js';
import { serviceCard } from '../../public/js/service-card.js';

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
  html.replace(/<[a-z0-9]+\b[^>]*\sdata-icon="([a-zA-Z]+)"(?:\s+data-icon-size="(\d+)")?[^>]*>/g, (tag, name, size) => tag + icon(name, Number(size) || 24));

// Botões de filtro já no HTML, para a barra não mudar de altura quando o JS arranca
function filterButtons(projects) {
  const total = (category) => projects.filter((p) => !category || p.category === category).length;
  return ['', ...categories]
    .map((c) => `<button class="filter${c ? '' : ' is-active'}" type="button" data-category="${c}">${c || 'Tudo'}<sup>${total(c)}</sup></button>`)
    .join('');
}

async function send(res, page, { status = 200, data, services = [] } = {}) {
  let html = withIcons(await template(page.file))
    .replace('<!--seo-->', renderHead(page))
    .replace('<!--data-->', data ? initialData(data) : '');
  if (page.file === 'trabalho') html = html.replace('<div class="filters" data-filters></div>', `<div class="filters" data-filters>${filterButtons(data.projects)}</div>`);
  if (page.file === 'servicos') html = html.replace('<!--services-->', services.map(serviceCard).join(''));
  res.status(status).type('html').set('Cache-Control', 'no-cache').send(html);
}

export async function notFoundPage(req, res) {
  await send(res, { file: '404', title: 'Página não encontrada', description: 'Esta página não existe.', noindex: true, path: req.path }, { status: 404 });
}

async function pageData() {
  const [projects, list] = await Promise.all([listPublished(), services.findAll()]);
  return { projects, featured: projects.filter((p) => p.featured).slice(0, 4), services: list };
}

const router = Router();

for (const path of Object.keys(staticPages())) {
  router.get(path, async (req, res) => {
    const data = await pageData();
    const page = staticPages(data)[path];

    const initial = {
      '/': { projects: data.projects, services: data.services },
      '/trabalho': { projects: data.projects, categories },
    }[path];

    await send(res, { ...page, path }, { data: initial, services: data.services });
  });
}

router.get('/trabalho/:slug', async (req, res) => {
  const result = await findWithNext(req.params.slug);
  if (!result) return notFoundPage(req, res);
  await send(res, projectPage(result.project, result.next), { data: result });
});

router.get('/galerias/:id', (req, res) =>
  send(res, { file: 'galeria', title: 'Galeria privada', description: 'Galeria privada de cliente.', noindex: true, path: req.path }),
);

router.get('/robots.txt', (req, res) => {
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /galerias', 'Disallow: /painel$', 'Disallow: /entrar$'];
  res.type('text/plain').send([...lines, '', `Sitemap: ${absolute('/sitemap.xml')}`, ''].join('\n'));
});

router.get('/sitemap.xml', async (req, res) => {
  const projects = await listPublished();
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ['/', '1.0', 'weekly'],
    ['/trabalho', '0.9', 'weekly'],
    ...projects.map((p) => [`/trabalho/${p.slug}`, '0.8', 'monthly']),
    ['/servicos', '0.7', 'monthly'],
    ['/estudio', '0.6', 'monthly'],
    ['/orcamento', '0.6', 'yearly'],
  ];

  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(([path, priority, freq]) => `  <url><loc>${absolute(path)}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`)
      .join('\n')}\n</urlset>\n`,
  );
});

export default router;
