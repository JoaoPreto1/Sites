import { Router } from 'express';
import { absolute } from '../seo/head.js';
import { serviceBySlug } from '../config/site.js';
import { aboutPage, article, breadcrumbs, creativeWork, itemList, service as serviceSchema, studio, website } from '../seo/schema.js';
import { entryBySlug, publishedEntries, publishedWorks, randomWork, workBySlug } from '../services/content.service.js';
import { entryBody, journalBody, studioBody } from '../views/pages/estudio.js';
import { serviceBody, servicesBody } from '../views/pages/servicos.js';
import { onTheTable } from '../services/projects.service.js';
import { documentHtml } from '../views/document.js';
import { homeBody } from '../views/pages/home.js';
import { workBody, worksBody } from '../views/pages/trabalhos.js';

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

router.get('/trabalhos', async (req, res, next) => {
  const tipo = typeof req.query.tipo === 'string' ? req.query.tipo : undefined;
  if (tipo && !serviceBySlug(tipo)) return next();
  const all = await publishedWorks();
  const works = tipo ? all.filter((w) => w.category === tipo) : all;
  const counts = all.reduce((acc, w) => ({ ...acc, [w.category]: (acc[w.category] ?? 0) + 1 }), { total: all.length });
  const label = tipo ? serviceBySlug(tipo).name : null;
  send(req, res, {
    page: {
      title: label ? `Trabalhos de ${label.toLowerCase()}` : 'Trabalhos',
      description: label ? `Trabalhos de ${label.toLowerCase()} feitos pela Pilha: ${works.map((w) => w.client).join(', ')}.` : `Marcas, sites, movimento, rótulos e livros feitos pela Pilha para ${all.length} clientes, de Matosinhos a Évora.`,
      path: tipo ? `/trabalhos?tipo=${tipo}` : '/trabalhos',
      schema: [breadcrumbs([['Início', '/'], ['Trabalhos', '/trabalhos']]), itemList('Trabalhos', works.map((w) => [w.title, `/trabalhos/${w.slug}`]))],
    },
    preload: works.slice(0, 1).map((w) => w.cover),
    body: worksBody({ works, category: tipo, counts }),
  });
});

// O bloco "?" da pilha: abre um trabalho ao calhas
router.get('/trabalhos/ao-calhas', async (req, res) => {
  const work = await randomWork();
  res.set('Cache-Control', 'no-store').redirect(302, `/trabalhos/${work.slug}`);
});

router.get('/trabalhos/:slug', async (req, res, next) => {
  const data = await workBySlug(req.params.slug).catch(() => null);
  if (!data) return next();
  const { work } = data;
  send(req, res, {
    page: {
      title: `${work.client}: ${work.title}`,
      description: work.summary,
      type: 'article',
      image: work.cover,
      schema: [creativeWork(work), breadcrumbs([['Início', '/'], ['Trabalhos', '/trabalhos'], [work.client, `/trabalhos/${work.slug}`]])],
    },
    preload: [work.cover],
    body: workBody(data),
  });
});

router.get('/servicos', async (req, res) => {
  const works = await publishedWorks();
  const counts = works.reduce((acc, w) => ({ ...acc, [w.category]: (acc[w.category] ?? 0) + 1 }), {});
  send(req, res, {
    page: {
      title: 'Serviços',
      description: 'Marcas, sites e lojas, movimento, rótulos e livros. O que inclui cada serviço da Pilha, quanto tempo demora e a ordem de grandeza do preço.',
      schema: [studio(), breadcrumbs([['Início', '/'], ['Serviços', '/servicos']])],
    },
    body: servicesBody({ counts }),
  });
});

router.get('/servicos/:slug', async (req, res, next) => {
  const service = serviceBySlug(req.params.slug);
  if (!service) return next();
  const works = await publishedWorks({ category: service.slug });
  send(req, res, {
    page: {
      title: `${service.name} (${service.sub})`,
      description: `${service.lead} Prazo habitual: ${service.duration}.`,
      schema: [serviceSchema(service), breadcrumbs([['Início', '/'], ['Serviços', '/servicos'], [service.name, `/servicos/${service.slug}`]])],
    },
    body: serviceBody({ service, works }),
  });
});

router.get('/estudio', (req, res) => {
  send(req, res, {
    page: {
      title: 'Estúdio',
      description: 'Quatro pessoas e uma mesa em Marvila, Lisboa. Quem somos, como trabalhamos em seis fases e onde estamos.',
      schema: [aboutPage(), studio(), breadcrumbs([['Início', '/'], ['Estúdio', '/estudio']])],
    },
    body: studioBody(),
  });
});

router.get('/diario', async (req, res) => {
  const entries = await publishedEntries();
  send(req, res, {
    page: {
      title: 'Diário',
      description: 'Notas curtas do estúdio sobre marcas, rótulos, tipografia, orçamentos e briefings: o que correu bem, o que mudámos e porquê.',
      schema: [breadcrumbs([['Início', '/'], ['Diário', '/diario']]), itemList('Diário', entries.map((e) => [e.title, `/diario/${e.slug}`]))],
    },
    body: journalBody({ entries }),
  });
});

router.get('/diario/:slug', async (req, res, next) => {
  const data = await entryBySlug(req.params.slug).catch(() => null);
  if (!data) return next();
  send(req, res, {
    page: {
      title: data.entry.title,
      description: data.entry.excerpt,
      type: 'article',
      schema: [article(data.entry), breadcrumbs([['Início', '/'], ['Diário', '/diario'], [data.entry.title, `/diario/${data.entry.slug}`]])],
    },
    body: entryBody(data),
  });
});

export default router;
