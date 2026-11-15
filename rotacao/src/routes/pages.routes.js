import { Router } from 'express';
import { cover } from '../../public/js/shared/format.js';
import { catalog, listRecords } from '../services/catalog.service.js';
import { day as roomDay } from '../services/room.service.js';
import { wall } from '../services/want.service.js';
import { today } from '../utils/dates.js';
import { absolute } from '../seo/head.js';
import { store } from '../seo/pages.js';
import { homePage } from '../views/pages/home.js';
import { documentHtml } from '../views/document.js';
import { notFoundView } from '../views/pages/not-found.js';

export function send(req, res, { status = 200, ...view }) {
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
  const [records, info, arrivals, rooms, wants] = await Promise.all([listRecords(), catalog(), listRecords({ ordem: 'chegada' }), roomDay(today()), wall()]);
  const first = arrivals[0];

  send(req, res, {
    page: {
      description: 'Loja de discos de vinil em Lisboa: folheia o caixote num gira-discos 3D e ouve 30 segundos de cada faixa antes de comprar. Três salas de ensaio no piso de baixo.',
      schema: [store()],
      preload: [{ href: cover(first, 300) }],
    },
    main: homePage({ records, crates: info.crates, grades: info.grades, arrivals: arrivals.slice(0, 10), rooms, wants: wants.slice(0, 4) }),
    css: ['home'],
    script: 'home',
    data: { records, crates: info.crates },
  });
});

router.get('/robots.txt', (req, res) => {
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /saco', 'Disallow: /conta', 'Disallow: /painel', 'Disallow: /entrar'];
  res.type('text/plain').send([...lines, '', `Sitemap: ${absolute('/sitemap.xml')}`, ''].join('\n'));
});

router.get('/sitemap.xml', async (req, res) => {
  const records = await listRecords();
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ['/', '1.0', 'daily'],
    ['/discos', '0.9', 'daily'],
    ...records.map((r) => [`/discos/${r.id}`, '0.8', 'weekly']),
    ['/salas', '0.8', 'weekly'],
    ['/procura', '0.6', 'daily'],
    ['/compramos', '0.6', 'monthly'],
  ];

  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(([path, priority, freq]) => `  <url><loc>${absolute(path)}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`)
      .join('\n')}\n</urlset>\n`,
  );
});

export default router;
