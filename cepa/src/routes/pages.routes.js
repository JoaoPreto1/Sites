import { Router } from 'express';
import { TYPES } from '../data/seed.js';
import { producers } from '../repositories/index.js';
import { catalog, listWines, pairing, wineDetail } from '../services/catalog.service.js';
import { overview as clubOverview } from '../services/club.service.js';
import { upcoming } from '../services/tasting.service.js';
import { absolute } from '../seo/head.js';
import { photoUrl, srcset } from '../seo/images.js';
import { breadcrumbs, productSchema, store } from '../seo/pages.js';
import { bottle } from '../../public/js/shared/bottle.js';
import { documentHtml } from '../views/document.js';
import { homePage } from '../views/pages/home.js';
import { ORDERS, PRICES, cartaPage } from '../views/pages/carta.js';
import { winePage } from '../views/pages/wine.js';
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

// Filtros da carta vindos do URL: o que não for válido é simplesmente ignorado
function cartaFilters(query, { types, regions, dishes }) {
  const pick = (value, list) => (list.some((item) => item.slug === value) ? value : undefined);
  const ate = Number(query.ate);
  const filters = {
    tipo: pick(query.tipo, types),
    regiao: pick(query.regiao, regions),
    prato: pick(query.prato, dishes),
    ate: PRICES.some(([value]) => value === ate) ? ate : undefined,
    ordem: ORDERS.some(([value]) => value === query.ordem) ? query.ordem : undefined,
    q: typeof query.q === 'string' ? query.q.trim().slice(0, 60) || undefined : undefined,
  };
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined));
}

function cartaTitle(filters, info) {
  const type = info.types.find((t) => t.slug === filters.tipo);
  const region = info.regions.find((r) => r.slug === filters.regiao);
  if (type && region) return `${type.name} do ${region.name}`;
  if (type) return `${type.name} portugueses`;
  if (region) return `Vinhos do ${region.name}`;
  return 'A carta de vinhos';
}

router.get('/carta', async (req, res) => {
  const info = await catalog();
  const filters = cartaFilters(req.query, info);
  const wines = await listWines(filters);
  const view = req.query.vista === 'garrafas' ? 'garrafas' : 'carta';
  const filtered = Object.keys(filters).length > 0;

  send(req, res, {
    page: {
      title: cartaTitle(filters, info),
      description: `${wines.length} vinhos portugueses de pequenos produtores, do Vinho Verde à Madeira. Notas de prova, castas e sugestões para a mesa, com envio em 24 horas.`,
      // Os filtros só mudam a lista: o canonical aponta sempre para a carta (exceto região e tipo, que são páginas úteis)
      path: filters.tipo || filters.regiao ? `/carta?${new URLSearchParams({ ...(filters.tipo && { tipo: filters.tipo }), ...(filters.regiao && { regiao: filters.regiao }) })}` : '/carta',
      noindex: filtered && Boolean(filters.q || filters.prato || filters.ate || filters.ordem),
      schema: [breadcrumbs([['Início', '/'], ['A carta', '/carta']])],
    },
    main: cartaPage({ wines, catalog: info, filters, view }),
    css: ['carta'],
    script: 'carta',
    data: { wines, types: TYPES },
  });
});

router.get('/carta/:slug', async (req, res) => {
  const result = await wineDetail(req.params.slug).catch(() => null);
  if (!result) return notFoundPage(req, res);
  const { wine, producer } = result;

  send(req, res, {
    page: {
      title: `${wine.name}${wine.year ? ` ${wine.year}` : ''} · ${wine.typeName} ${wine.regionName}`,
      description: `${wine.notes} ${wine.grapes.join(', ')}, de ${producer.name}. ${wine.price.toFixed(2).replace('.', ',')} € a garrafa.`,
      image: photoUrl(producer.photo, 1200, 0.525),
      type: 'product',
      schema: [productSchema(wine, producer), breadcrumbs([['Início', '/'], ['A carta', '/carta'], [wine.name, `/carta/${wine.slug}`]])],
    },
    main: winePage(result),
    css: ['carta', 'wine'],
    script: 'wine',
    data: { related: result.related },
  });
});

// A garrafa desenhada também existe como imagem própria (usada nos dados estruturados)
router.get('/carta/:slug/garrafa.svg', async (req, res) => {
  const result = await wineDetail(req.params.slug).catch(() => null);
  if (!result) return notFoundPage(req, res);
  res.type('image/svg+xml').set('Cache-Control', 'public, max-age=86400').send(bottle(result.wine).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="600" '));
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
