import { Router } from 'express';
import { TYPES } from '../data/seed.js';
import { producers } from '../repositories/index.js';
import { catalog, listWines, pairing } from '../services/catalog.service.js';
import { overview as clubOverview } from '../services/club.service.js';
import { upcoming } from '../services/tasting.service.js';
import { absolute } from '../seo/head.js';
import { srcset } from '../seo/images.js';
import { store } from '../seo/pages.js';
import { documentHtml } from '../views/document.js';
import { homePage } from '../views/pages/home.js';
import { notFoundView } from '../views/pages/not-found.js';

function send(req, res, { status = 200, ...view }) {
  res.status(status).type('html').set('Cache-Control', 'no-cache').send(documentHtml({ ...view, path: req.path }));
}

export function notFoundPage(req, res) {
  send(req, res, {
    status: 404,
    page: { title: 'Página não encontrada', description: 'Esta página não existe.', noindex: true },
    main: notFoundView(),
    css: ['not-found'],
  });
}

const router = Router();

router.get('/', async (req, res) => {
  const [suggestion, { regions, dishes, total }, featured, club, tastings, producer] = await Promise.all([
    pairing({ prato: 'polvo', pessoas: 4, orcamento: 20 }),
    catalog(),
    listWines({ destaque: true }),
    clubOverview(),
    upcoming(),
    producers.findById('p-fraga'),
  ]);
  const producerWines = await listWines();
  const feature = { producer, wines: producerWines.filter((w) => w.producerId === producer.id) };

  send(req, res, {
    page: {
      description: 'Garrafeira no Porto com mais de vinte vinhos portugueses de pequenos produtores. Diga-nos o que vai para a mesa e sugerimos o vinho. Clube mensal e provas.',
      schema: [store()],
      preload: [{ srcset: srcset('https://images.unsplash.com/photo-1553361371-9b22f78e8b1d', [400, 600, 800], 1.4), sizes: '(max-width: 900px) 100vw, 34vw' }],
    },
    main: homePage({ pairing: suggestion, dishes, regions, featured, types: TYPES, total, feature, club, tastings: tastings.slice(0, 3) }),
    css: ['home'],
    script: 'home',
    data: { pairing: suggestion, featured, feature: feature.wines },
  });
});

router.get('/robots.txt', (req, res) => {
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /cesto', 'Disallow: /conta', 'Disallow: /painel', 'Disallow: /entrar'];
  res.type('text/plain').send([...lines, '', `Sitemap: ${absolute('/sitemap.xml')}`, ''].join('\n'));
});

router.get('/sitemap.xml', async (req, res) => {
  const wines = await listWines();
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ['/', '1.0', 'weekly'],
    ['/carta', '0.9', 'weekly'],
    ...wines.map((w) => [`/carta/${w.slug}`, '0.8', 'weekly']),
    ['/produtores', '0.7', 'monthly'],
    ['/provas', '0.7', 'weekly'],
    ['/clube', '0.7', 'monthly'],
  ];

  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(([path, priority, freq]) => `  <url><loc>${absolute(path)}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`)
      .join('\n')}\n</urlset>\n`,
  );
});

export default router;
