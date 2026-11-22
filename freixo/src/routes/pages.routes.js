import { Router } from 'express';
import { documentHtml } from '../views/document.js';
import { absolute } from '../seo/head.js';
import { breadcrumbs, eventList, organization, serviceCatalog, website } from '../seo/schema.js';
import * as content from '../services/content.service.js';
import { deskStatus } from '../services/today.service.js';
import { srcset } from '../views/html.js';
import { homeBody } from '../views/pages/home.js';
import { municipioBody } from '../views/pages/municipio.js';
import { servicosBody } from '../views/pages/servicos.js';
import { viverBody } from '../views/pages/viver.js';
import { SERVICE_CATEGORIES } from '../config/municipio.js';

export function send(req, res, { status = 200, ...view }) {
  res.status(status).type('html').set('Cache-Control', 'no-cache').send(documentHtml({ ...view, path: req.path }));
}

export function notFoundPage(req, res) {
  send(req, res, {
    status: 404,
    page: { title: 'Página não encontrada', description: 'A página que procura não existe.', noindex: true },
    body: `<section class="phero"><div class="wrap"><h1>Esta página <i>não existe</i></h1><p>Pode ter mudado de sítio. Experimente a pesquisa ou volte ao início.</p></div></section>`,
  });
}

const heroPreload = (key) => [{ srcset: srcset(key), sizes: '100vw' }];

const router = Router();

router.get('/robots.txt', (req, res) => {
  res.type('text').send(['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /balcao', 'Disallow: /painel', 'Disallow: /entrar', '', `Sitemap: ${absolute('/sitemap.xml')}`].join('\n'));
});

router.get('/sitemap.xml', async (req, res) => {
  const news = await content.listNews();
  const paths = ['/', '/municipio', '/servicos', '/viver', '/visitar', '/investir', '/atualidade', ...news.map((n) => `/atualidade/${n.slug}`), '/contactos'];
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${absolute(p)}</loc></url>`).join('\n')}
</urlset>`,
  );
});

router.get('/', async (req, res) => {
  const [news, events, notices, editais] = await Promise.all([content.listNews(), content.listEvents(), content.listNotices(), content.listEditais()]);
  send(req, res, {
    page: {
      description: 'Site do Município de Freixo de Espada à Cinta: Balcão Online, serviços, notícias e agenda, viver no concelho e visitar a vila manuelina do Douro Internacional.',
      schema: [organization(), website(), ...eventList(events.slice(0, 4))],
      preload: heroPreload('penedo'),
    },
    body: homeBody({ news, events, notices, editais, desk: deskStatus() }),
  });
});

router.get('/municipio', (req, res) => {
  send(req, res, {
    page: {
      title: 'Município',
      description: 'Câmara Municipal, Assembleia Municipal, as quatro freguesias, a história dos forais, o brasão e as lendas do nome, e os documentos de transparência do Município.',
      image: '/img/vila-1600.webp',
      schema: [breadcrumbs([['Início', '/'], ['Município', '/municipio']])],
      preload: heroPreload('vila'),
    },
    body: municipioBody(),
  });
});

router.get('/servicos', async (req, res) => {
  const services = await content.listServices();
  const cat = SERVICE_CATEGORIES.find(([v]) => v === req.query.categoria)?.[0];
  const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : '';
  send(req, res, {
    page: {
      title: 'Serviços',
      description: 'Todos os serviços do Município de Freixo de Espada à Cinta: água, obras, ação social, educação e atendimento. O que precisa, quanto demora e se pode tratar online.',
      path: '/servicos',
      schema: [serviceCatalog(services), breadcrumbs([['Início', '/'], ['Serviços', '/servicos']])],
      preload: heroPreload('penedo'),
    },
    body: servicosBody({ services, cat, q }),
    scripts: ['servicos'],
  });
});

router.get('/viver', (req, res) => {
  send(req, res, {
    page: {
      title: 'Viver no concelho',
      description: 'Guia para viver em Freixo de Espada à Cinta: apoios à fixação, habitação, escolas, saúde, apoio social, transporte a pedido e como chegar.',
      image: '/img/amendoeiras-1280.webp',
      schema: [breadcrumbs([['Início', '/'], ['Viver', '/viver']])],
      preload: heroPreload('amendoeiras'),
    },
    body: viverBody(),
  });
});

export default router;
