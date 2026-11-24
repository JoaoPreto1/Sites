import { Router } from 'express';
import { absolute } from '../seo/head.js';
import { organization, website } from '../seo/schema.js';
import * as adsService from '../services/ads.service.js';
import * as fund from '../services/fund.service.js';
import { isDemo } from '../services/payments/index.js';
import * as settings from '../services/settings.service.js';
import { documentHtml } from '../views/document.js';
import { homeBody } from '../views/pages/home.js';
import { detailBody, listBody } from '../views/pages/pedidos.js';
import { donateBody, receiptBody, simulationBody } from '../views/pages/pagamentos.js';
import { CATEGORY_IDS, DISTRICTS, LIMITS } from '../config/platform.js';
import { adPage, breadcrumbs, faq } from '../seo/schema.js';
import { manterBody, transparenciaBody } from '../views/pages/plataforma.js';
import { comoFuncionaBody, condicoesBody, FAQ, privacidadeBody } from '../views/pages/info.js';

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

const pick = (value, allowed) => (typeof value === 'string' && allowed.includes(value) ? value : '');

router.get('/pedidos', async (req, res) => {
  const filters = {
    categoria: pick(req.query.categoria, CATEGORY_IDS),
    distrito: pick(req.query.distrito, DISTRICTS),
    q: typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : '',
    ordem: pick(req.query.ordem, ['recentes', 'falta', 'prazo']),
  };
  const { active, done } = await adsService.listPublic(filters);
  const filtered = filters.categoria || filters.distrito || filters.q;
  send(req, res, {
    page: {
      title: 'Pedidos de ajuda',
      description: 'Pedidos de ajuda moderados para pagar renda, luz, água, alimentação, saúde, transportes e educação em Portugal. Veja o que falta e ajude com o valor que puder.',
      path: '/pedidos',
      noindex: Boolean(filtered),
      schema: [breadcrumbs([['Início', '/'], ['Pedidos', '/pedidos']])],
    },
    body: listBody({ active, done, filters }),
  });
});

router.get('/pedidos/:slug', async (req, res, next) => {
  const ad = await adsService.findPublicBySlug(req.params.slug);
  if (!ad) return next();
  send(req, res, {
    page: {
      title: ad.title,
      description: `${ad.categoryLabel}: ${ad.story.slice(0, 140).trim()}…`,
      type: 'article',
      schema: [adPage(ad), breadcrumbs([['Início', '/'], ['Pedidos', '/pedidos'], [ad.title, `/pedidos/${ad.slug}`]])],
    },
    body: detailBody(ad),
    scripts: ['pedido'],
  });
});

router.get('/doar/:slug', async (req, res, next) => {
  const ad = await adsService.findPublicBySlug(req.params.slug);
  if (!ad) return next();
  if (ad.status !== 'ativo') return res.redirect(303, `/pedidos/${ad.slug}`);
  const asked = Math.round(Number(String(req.query.valor ?? '').replace(',', '.')) * 100);
  const cents = Number.isFinite(asked) && asked >= LIMITS.donationMinCents ? Math.min(asked, ad.remainingCents, LIMITS.donationMaxCents) : Math.min(1000, ad.remainingCents);
  const [launch, s] = await Promise.all([settings.launchStatus(), settings.get()]);
  sendPrivate(req, res, {
    page: { title: `Doar: ${ad.title}`, description: 'Resumo da doação antes de confirmar.' },
    body: donateBody({ ad, cents, launch, fees: s.fees, demo: isDemo }),
    scripts: ['doar'],
  });
});

router.get('/manter', async (req, res) => {
  send(req, res, {
    page: {
      title: 'Manter a plataforma',
      description: 'Quanto custa manter a Amparo a funcionar, quanto foi recebido este mês, para quantos meses chega o saldo e como contribuir, separado das doações para pedidos.',
      schema: [breadcrumbs([['Início', '/'], ['Manter a plataforma', '/manter']])],
    },
    body: manterBody({ fund: await fund.platformFund(), demo: isDemo }),
    scripts: ['manter'],
  });
});

router.get('/transparencia', async (req, res) => {
  const [t, launch, s] = await Promise.all([fund.transparency(), settings.launchStatus(), settings.get()]);
  send(req, res, {
    page: {
      title: 'Transparência',
      description: 'Totais agregados das doações recebidas e entregues, comissões, fundo da plataforma e a lista do que falta definir antes de aceitar dinheiro real.',
      schema: [breadcrumbs([['Início', '/'], ['Transparência', '/transparencia']])],
    },
    body: transparenciaBody({ t, launch, fees: s.fees, demo: isDemo }),
  });
});

router.get('/como-funciona', async (req, res) => {
  send(req, res, {
    page: {
      title: 'Como funciona',
      description: 'Como pedir ajuda, como funciona a moderação, como doar, que comissões existem, como pedir mais informação sobre um pedido e como denunciar.',
      schema: [faq(FAQ), breadcrumbs([['Início', '/'], ['Como funciona', '/como-funciona']])],
    },
    body: comoFuncionaBody({ fees: await settings.fees() }),
  });
});

router.get('/privacidade', (req, res) => {
  send(req, res, {
    page: { title: 'Privacidade e segurança', description: 'Que dados pessoais a Amparo guarda, para quê, quem os pode ver e durante quanto tempo, os seus direitos e as medidas de segurança.' },
    body: privacidadeBody(),
  });
});

router.get('/condicoes', async (req, res) => {
  send(req, res, {
    page: { title: 'Condições de utilização', description: 'Regras para pedir ajuda e doar na Amparo, e os pontos que ainda estão por definir antes do lançamento.' },
    body: condicoesBody({ launch: await settings.launchStatus() }),
  });
});

const KINDS = ['doacao', 'plataforma'];

router.get('/simulacao/:kind/:id', (req, res, next) => {
  if (!isDemo || !KINDS.includes(req.params.kind)) return next();
  sendPrivate(req, res, { page: { title: 'Simulação de pagamento', description: 'Simulação: nenhum dinheiro é movimentado.' }, body: simulationBody(req.params), scripts: ['simulacao'] });
});

router.get('/recibo/:kind/:id', (req, res, next) => {
  if (!KINDS.includes(req.params.kind)) return next();
  sendPrivate(req, res, { page: { title: 'Comprovativo', description: 'Comprovativo da doação.' }, body: receiptBody(req.params), scripts: ['recibo'] });
});

export default router;
