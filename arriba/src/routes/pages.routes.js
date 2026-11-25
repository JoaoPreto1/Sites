import { Router } from 'express';
import { validationResult } from 'express-validator';
import { ROOM_NUMS, ROOM_TYPES, typeBySlug } from '../config/site.js';
import { absolute } from '../seo/head.js';
import { breadcrumbs, hotel, hotelRoom, itemList, restaurant, website } from '../seo/schema.js';
import * as booking from '../services/booking.service.js';
import { dayShort } from '../utils/dates.js';
import { documentHtml, preloadPhoto } from '../views/document.js';
import { initialData } from '../views/html.js';
import { guestBody, deskBody, loginBody, registerBody } from '../views/pages/conta.js';
import { homeBody, homeDescription } from '../views/pages/home.js';
import { roomBody, roomsBody } from '../views/pages/quartos.js';
import { bookingBody } from '../views/pages/reservar.js';
import { restaurantBody, restaurantDescription } from '../views/pages/restaurante.js';
import { stayQuery, toStay } from '../validation/stay.js';

export function send(req, res, { status = 200, ...view }) {
  res.status(status).type('html').set('Cache-Control', 'no-cache').send(documentHtml({ ...view, path: req.path }));
}

// Páginas privadas: nunca indexadas nem guardadas em cache partilhada
function sendPrivate(req, res, view) {
  res.set({ 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' });
  res.status(200).type('html').send(documentHtml({ ...view, page: { ...view.page, noindex: true }, path: req.path }));
}

export function notFoundPage(req, res) {
  send(req, res, {
    status: 404,
    page: { title: 'Página não encontrada', description: 'Esta página não existe.', noindex: true },
    body: `<section class="porta"><div class="cx porta__g"><div class="porta__t"><p class="rot">Erro 404</p><h1>Este gancho está vazio.</h1><p>A página que procura mudou de sítio ou nunca existiu.</p><p class="sessao__acoes"><a class="btn btn--verde" href="/">Voltar à receção</a><a class="btn btn--linha" href="/quartos">Ver os quartos</a></p></div><div class="porta__chave" aria-hidden="true"><img src="/img/chave.webp" width="600" height="900" alt="" decoding="async"></div></div></section>`,
  });
}

// Lê as datas do endereço; se estiverem erradas usa o próximo fim de semana e avisa
async function stayFromQuery(req) {
  for (const rule of stayQuery) await rule.run(req);
  const ok = validationResult(req).isEmpty();
  const stay = ok ? toStay(req.query) : {};
  try {
    return { a: await booking.availability({ ...stay, guests: stay.guests ? Number(stay.guests) : undefined }), warning: ok ? null : 'datas' };
  } catch {
    return { a: await booking.availability({}), warning: 'datas' };
  }
}

const warningBox = (w) => (w ? '<p class="aviso cx" role="status">As datas que escolheu não são válidas. Mostramos o próximo fim de semana.</p>' : '');

const router = Router();

router.get('/robots.txt', (req, res) => {
  res.type('text').send(['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /entrar', 'Disallow: /criar-conta', 'Disallow: /reservar', 'Disallow: /hospede', 'Disallow: /rececao', '', `Sitemap: ${absolute('/sitemap.xml')}`].join('\n'));
});

router.get('/sitemap.xml', (req, res) => {
  const urls = ['/', '/quartos', ...ROOM_TYPES.map((t) => `/quartos/${t.slug}`), '/restaurante'];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${absolute(p)}</loc></url>`).join('\n')}
</urlset>`);
});

router.get('/', async (req, res) => {
  const { a, warning } = await stayFromQuery(req);
  const [menu, table] = await Promise.all([booking.currentMenu(), booking.priceTable()]);
  const hasQuery = Object.keys(req.query).length > 0;
  send(req, res, {
    page: { description: homeDescription(a), path: '/', schema: [website(), hotel(table)] },
    bodyClass: 'inicio',
    preload: [
      { href: '/img/quadro.webp', media: '(min-width: 821px)' },
      { href: '/img/quadro-telemovel.webp', media: '(max-width: 820px)' },
    ],
    body: (hasQuery ? warningBox(warning) : '') + homeBody({ a, menu }),
    data: initialData({ a, types: ROOM_TYPES.map((t) => ({ slug: t.slug, name: t.name, lead: t.lead, photo: t.photos[0] })) }),
    scripts: ['inicio'],
  });
});

router.get('/quartos', async (req, res) => {
  const { a } = await stayFromQuery(req);
  send(req, res, {
    page: {
      title: 'Quartos',
      description: `Os 14 quartos do hotel Arriba em Sagres: Suite Farol, Falésia, Pátio e Duna, de ${Math.min(...a.types.map((t) => t.price))} € a ${Math.max(...a.types.map((t) => t.price))} € por noite com pequeno-almoço.`,
      path: '/quartos',
      schema: [breadcrumbs([['Início', '/'], ['Quartos', '/quartos']]), itemList('Quartos', ROOM_TYPES.map((t) => [t.name, `/quartos/${t.slug}`]))],
    },
    preload: [preloadPhoto(ROOM_TYPES[0].photos[0], '(max-width: 820px) 100vw, 40vw')],
    body: roomsBody({ a }),
  });
});

router.get('/quartos/:slug', async (req, res, next) => {
  const type = typeBySlug(req.params.slug);
  if (!type) return next();
  const [{ a }, calendar, table] = await Promise.all([stayFromQuery(req), booking.typeCalendar(type.slug), booking.priceTable()]);
  send(req, res, {
    page: {
      title: `Quarto ${type.name}`,
      description: `${type.lead} ${type.size} m², ${type.bed.toLowerCase()}, vista ${type.view.toLowerCase()}. ${table[type.slug]} € por noite com pequeno-almoço, no hotel Arriba em Sagres.`,
      path: `/quartos/${type.slug}`,
      image: type.photos[0],
      schema: [hotelRoom(type, table[type.slug]), breadcrumbs([['Início', '/'], ['Quartos', '/quartos'], [type.name, `/quartos/${type.slug}`]])],
    },
    preload: [preloadPhoto(type.photos[0], '(max-width: 820px) 100vw, 58vw')],
    body: roomBody({ type, price: table[type.slug], calendar, a, table }),
  });
});

router.get('/restaurante', async (req, res) => {
  const menu = await booking.currentMenu();
  send(req, res, {
    page: {
      title: 'Restaurante',
      description: restaurantDescription(menu),
      schema: [restaurant(menu), breadcrumbs([['Início', '/'], ['Restaurante', '/restaurante']])],
    },
    preload: [preloadPhoto('petiscos', '(max-width: 820px) 100vw, 46vw')],
    body: restaurantBody({ menu }),
  });
});

// Reservar: a escolha da chave é pública; a confirmação pede sessão (feita pelo JavaScript com a API)
router.get('/reservar', async (req, res) => {
  const { a, warning } = await stayFromQuery(req);
  const quarto = ROOM_NUMS.includes(req.query.quarto) ? req.query.quarto : null;
  const tipo = typeBySlug(req.query.tipo);
  const chosen = quarto ?? (tipo && a.types.find((t) => t.slug === tipo.slug)?.free[0]) ?? null;
  sendPrivate(req, res, {
    page: { title: 'Reservar', description: `Reservar um quarto no hotel Arriba de ${dayShort(a.checkIn)} a ${dayShort(a.checkOut)}.` },
    body: warningBox(warning) + bookingBody({ a, chosen }),
    scripts: ['reservar'],
  });
});

router.get('/entrar', (req, res) => {
  sendPrivate(req, res, { page: { title: 'Entrar', description: 'Entrar na área da reserva ou no painel da receção.' }, body: loginBody(), scripts: ['entrar'] });
});

router.get('/criar-conta', (req, res) => {
  sendPrivate(req, res, { page: { title: 'Criar conta', description: 'Criar conta para reservar e gerir a estadia.' }, body: registerBody(), scripts: ['criar-conta'] });
});

router.get('/hospede', (req, res) => {
  sendPrivate(req, res, { page: { title: 'As suas reservas', description: 'Reservas, hora de chegada e pedidos.' }, body: guestBody(), scripts: ['hospede'] });
});

router.get('/rececao', (req, res) => {
  sendPrivate(req, res, { page: { title: 'Painel da receção', description: 'Chegadas, saídas, reservas, pedidos e ementa.' }, body: deskBody(), scripts: ['rececao'] });
});

export default router;
