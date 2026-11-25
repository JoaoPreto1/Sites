import { Router } from 'express';
import { absolute } from '../seo/head.js';
import { studio, website } from '../seo/schema.js';
import { publishedEntries, publishedWorks } from '../services/content.service.js';
import { onTheTable } from '../services/projects.service.js';
import { documentHtml } from '../views/document.js';
import { homeBody } from '../views/pages/home.js';

export function send(req, res, { status = 200, ...view }) {
  res.status(status).type('html').set('Cache-Control', 'no-cache').send(documentHtml({ ...view, path: req.path }));
}

// Páginas privadas: nunca indexadas nem guardadas em cache partilhada
export function sendPrivate(req, res, view) {
  res.set({ 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' });
  res.status(200).type('html').send(documentHtml({ ...view, page: { ...view.page, noindex: true }, path: req.path }));
}

export function notFoundPage(req, res) {
  send(req, res, {
    status: 404,
    page: { title: 'Página não encontrada', description: 'Esta página não existe.', noindex: true },
    body: `<section class="phead lost"><div class="wrap"><p class="kicker">Erro 404</p><h1 class="display">Este bloco<br>caiu da <em>pilha.</em></h1><p class="lead">A página pode ter mudado de sítio. Volta ao início e pega noutro bloco.</p><p class="lost__acts"><a class="btn btn--ink" href="/">Voltar à pilha</a><a class="btn" href="/trabalhos">Ver trabalhos</a></p></div></section>`,
  });
}

const router = Router();

router.get('/robots.txt', (req, res) => {
  res.type('text').send(['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /entrar', 'Disallow: /cliente', 'Disallow: /painel', '', `Sitemap: ${absolute('/sitemap.xml')}`].join('\n'));
});

router.get('/sitemap.xml', async (req, res) => {
  const [works, entries] = await Promise.all([publishedWorks(), publishedEntries()]);
  const urls = [
    ['/', null],
    ['/trabalhos', works[0]?.publishedAt],
    ...works.map((w) => [`/trabalhos/${w.slug}`, w.updatedAt ?? w.publishedAt]),
    ['/servicos', null],
    ...['marcas', 'sites', 'movimento', 'rotulos', 'livros'].map((s) => [`/servicos/${s}`, null]),
    ['/estudio', null],
    ['/diario', entries[0]?.publishedAt],
    ...entries.map((e) => [`/diario/${e.slug}`, e.updatedAt ?? e.publishedAt]),
    ['/contacto', null],
  ];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, mod]) => `  <url><loc>${absolute(p)}</loc>${mod ? `<lastmod>${mod.slice(0, 10)}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`);
});

router.get('/', async (req, res) => {
  const [works, onTable, entries] = await Promise.all([publishedWorks(), onTheTable(), publishedEntries()]);
  send(req, res, {
    page: {
      description: 'Estúdio de marcas e sites em Lisboa. Marcas, sites e lojas, movimento, rótulos e livros: atira-nos um problema e nós empilhamos a solução.',
      schema: [website(), studio()],
    },
    bodyClass: 'is-home',
    body: homeBody({ featured: works.filter((w) => w.featured).slice(0, 6), onTable, entries: entries.slice(0, 3) }),
    scripts: ['pilha'],
  });
});

export default router;
