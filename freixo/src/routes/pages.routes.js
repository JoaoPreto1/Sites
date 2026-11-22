import { Router } from 'express';
import { documentHtml } from '../views/document.js';
import { absolute } from '../seo/head.js';
import { eventList, organization, website } from '../seo/schema.js';
import * as content from '../services/content.service.js';
import { deskStatus } from '../services/today.service.js';
import { srcset } from '../views/html.js';
import { homeBody } from '../views/pages/home.js';

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

export default router;
