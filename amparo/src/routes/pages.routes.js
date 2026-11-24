import { Router } from 'express';
import { absolute } from '../seo/head.js';
import { organization, website } from '../seo/schema.js';
import * as adsService from '../services/ads.service.js';
import * as fund from '../services/fund.service.js';
import { isDemo } from '../services/payments/index.js';
import * as settings from '../services/settings.service.js';
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
    body: `<section class="phead"><div class="wrap"><p class="kicker">Erro 404</p><h1>Esta linha não está na conta.</h1><p class="lead">A página pode ter mudado de sítio, ou o pedido já foi retirado.</p><p><a class="btn btn--ink" href="/pedidos">Ver pedidos</a></p></div></section>`,
  });
}

const router = Router();

router.get('/robots.txt', (req, res) => {
  res.type('text').send(['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /conta', 'Disallow: /entrar', 'Disallow: /registar', 'Disallow: /simulacao/', 'Disallow: /recibo/', '', `Sitemap: ${absolute('/sitemap.xml')}`].join('\n'));
});

router.get('/sitemap.xml', async (req, res) => {
  const { active } = await adsService.listPublic();
  const paths = ['/', '/pedidos', ...active.map((a) => `/pedidos/${a.slug}`), '/como-funciona', '/manter', '/transparencia', '/privacidade', '/condicoes'];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${absolute(p)}</loc></url>`).join('\n')}
</urlset>`);
});

router.get('/', async (req, res) => {
  const [{ active }, platform, launch] = await Promise.all([adsService.listPublic({ ordem: 'prazo' }), fund.platformFund(), settings.launchStatus()]);
  send(req, res, {
    page: {
      description: 'Plataforma de doações entre pessoas em Portugal: peça ajuda para pagar renda, luz, água, alimentação, saúde, transportes ou educação, ou ajude a pagar as contas de outra pessoa.',
      schema: [website(), organization()],
    },
    body: homeBody({ active, fund: platform, launch, demo: isDemo }),
  });
});

export default router;
