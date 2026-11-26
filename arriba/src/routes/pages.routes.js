import { Router } from 'express';
import { validationResult } from 'express-validator';
import { ROOM_NUMS, ROOM_TYPES, typeBySlug } from '../config/site.js';
import { absolute } from '../seo/head.js';
import { aboutPage, breadcrumbs, hotel, hotelRoom, itemList, restaurant, website } from '../seo/schema.js';
import * as booking from '../services/booking.service.js';
import { dayShort } from '../utils/dates.js';
import { documentHtml, preloadPhoto } from '../views/document.js';
import { initialData } from '../views/html.js';
import { arrivalBody, houseBody, sagresBody } from '../views/pages/casa.js';
import { deskBody, guestBody, loginBody, registerBody } from '../views/pages/conta.js';
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
  res.status(200).type('html').send(documentHtml({ solid: true, bodyClass: 'solido', ...view, page: { ...view.page, noindex: true }, path: req.path }));
}

export function notFoundPage(req, res) {
  send(req, res, {
    status: 404,
    solid: true,
    bodyClass: 'solido',
    page: { title: 'Página não encontrada', description: 'Esta página não existe.', noindex: true },
    body: `<section class="porta"><div class="porta__t"><p class="e c">Erro 404</p><h1>Este gancho<br><em>está vazio.</em></h1><p class="porta__lead">A página que procura mudou de sítio ou nunca existiu.</p><p class="res-pg__acoes"><a class="bt" href="/">Voltar ao início</a><a class="bt bt--linha" href="/quartos">Ver os quartos</a></p></div><div class="porta__im" aria-hidden="true"><img src="/img/chave.webp" width="960" height="1200" alt="" decoding="async"></div></section>`,
  });
}

// Lê as datas do endereço; se estiverem erradas usa o próximo fim de semana e avisa
async function stayFromQuery(req) {
  for (const rule of stayQuery) await rule.run(req);
  const ok = validationResult(req).isEmpty();
  const stay = ok ? toStay(req.query) : {};
  try {
    return { a: await booking.availability({ ...stay, guests: stay.guests ? Number(stay.guests) : undefined }), warning: !ok };
  } catch {
    return { a: await booking.availability({}), warning: true };
  }
}

const warningBox = (w) => (w ? '<p class="aviso" role="status">As datas que escolheu não são válidas. Mostramos o próximo fim de semana.</p>' : '');
const heroPreload = (name) => [preloadPhoto(name, '100vw')];

const router = Router();

router.get('/robots.txt', (req, res) => {
  res.type('text').send(['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /entrar', 'Disallow: /criar-conta', 'Disallow: /reservar', 'Disallow: /hospede', 'Disallow: /rececao', '', `Sitemap: ${absolute('/sitemap.xml')}`].join('\n'));
});

router.get('/sitemap.xml', (req, res) => {
  const urls = ['/', '/quartos', ...ROOM_TYPES.map((t) => `/quartos/${t.slug}`), '/a-casa', '/restaurante', '/sagres', '/como-chegar'];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${absolute(p)}</loc></url>`).join('\n')}
</urlset>`);
});

router.get('/', async (req, res) => {
  const { a, warning } = await stayFromQuery(req);
  const [menu, table] = await Promise.all([booking.currentMenu(), booking.priceTable()]);
  send(req, res, {
    page: { description: homeDescription(a), path: '/', schema: [website(), hotel(table)] },
    bodyClass: 'inicio',
    preload: heroPreload('costa'),
    body: warningBox(warning && Object.keys(req.query).length) + homeBody({ a, menu, table }),
    data: initialData({ a }),
    scripts: ['inicio'],
  });
});

router.get('/quartos', async (req, res) => {
  const [{ a }, table] = await Promise.all([stayFromQuery(req), booking.priceTable()]);
  send(req, res, {
    page: {
      title: 'Quartos',
      description: `Os 14 quartos do hotel Arriba em Sagres: Suite Farol, Falésia, Pátio e Duna, de ${Math.min(...Object.values(table))} € a ${Math.max(...Object.values(table))} € por noite com pequeno-almoço.`,
      path: '/quartos',
      schema: [breadcrumbs([['Início', '/'], ['Quartos', '/quartos']]), itemList('Quartos', ROOM_TYPES.map((t) => [t.name, `/quartos/${t.slug}`]))],
    },
    preload: heroPreload('qmadeira'),
    body: roomsBody({ a, table }),
  });
});

router.get('/quartos/:slug', async (req, res, next) => {
  const type = typeBySlug(req.params.slug);
  if (!type) return next();
  const [{ a }, table] = await Promise.all([stayFromQuery(req), booking.priceTable()]);
  const start = `${a.checkIn.slice(0, 7)}-01`;
  const calendar = await booking.nightsCalendar({ from: start, days: 62, type: type.slug, guests: 1 });
  send(req, res, {
    page: {
      title: `Quarto ${type.name}`,
      description: `${type.lead} ${type.size} m², ${type.bed.toLowerCase()}, vista ${type.view.toLowerCase()}. ${table[type.slug]} € por noite com pequeno-almoço, no hotel Arriba em Sagres.`,
      path: `/quartos/${type.slug}`,
      image: type.photos[0],
      schema: [hotelRoom(type, table[type.slug]), breadcrumbs([['Início', '/'], ['Quartos', '/quartos'], [type.name, `/quartos/${type.slug}`]])],
    },
    preload: heroPreload(type.photos[0]),
    body: roomBody({ type, price: table[type.slug], calendar, a, table }),
    scripts: ['quarto'],
  });
});

router.get('/a-casa', (req, res) => {
  send(req, res, {
    page: { title: 'A casa', description: 'Uma casa de pescadores em Sagres com piscina de água salgada, terraço coberto, sala e massagens por marcação. O que está incluído no preço.', schema: [aboutPage('/a-casa', 'A casa'), breadcrumbs([['Início', '/'], ['A casa', '/a-casa']])] },
    preload: heroPreload('arcosbrancos'),
    body: houseBody(),
  });
});

router.get('/sagres', (req, res) => {
  send(req, res, {
    page: { title: 'Sagres à volta', description: 'O que fazer à volta do hotel Arriba: praia do Tonel e da Mareta, fortaleza de Sagres, cabo de São Vicente e saídas de barco, a pé ou de bicicleta.', schema: [breadcrumbs([['Início', '/'], ['Sagres', '/sagres']])] },
    preload: heroPreload('pordosol'),
    body: sagresBody(),
  });
});

router.get('/como-chegar', (req, res) => {
  send(req, res, {
    page: { title: 'Como chegar', description: 'Como chegar ao hotel Arriba, em Sagres: 1h20 de Faro, 3h de Lisboa, estacionamento no pátio, entrada das 15h às 23h.', schema: [breadcrumbs([['Início', '/'], ['Como chegar', '/como-chegar']])] },
    preload: heroPreload('falesia'),
    body: arrivalBody(),
  });
});

router.get('/restaurante', async (req, res) => {
  const menu = await booking.currentMenu();
  send(req, res, {
    page: { title: 'Restaurante', description: restaurantDescription(menu), schema: [restaurant(menu), breadcrumbs([['Início', '/'], ['Restaurante', '/restaurante']])] },
    preload: heroPreload('petiscos'),
    body: restaurantBody({ menu }),
  });
});

// Reservar: escolher a chave é público; a confirmação pede sessão (feita pelo JavaScript com a API)
router.get('/reservar', async (req, res) => {
  const { a, warning } = await stayFromQuery(req);
  const quarto = ROOM_NUMS.includes(req.query.quarto) ? req.query.quarto : null;
  const tipo = typeBySlug(req.query.tipo);
  const chosen = (quarto && a.free.includes(quarto) && quarto) || (tipo && a.types.find((t) => t.slug === tipo.slug)?.free[0]) || (a.free.includes('03') ? '03' : a.free[0]) || null;
  const nights = await booking.nightsCalendar({ from: `${a.checkIn.slice(0, 7)}-01`, days: 62, guests: a.guests });
  sendPrivate(req, res, {
    page: { title: 'Reservar', description: `Reservar um quarto no hotel Arriba de ${dayShort(a.checkIn)} a ${dayShort(a.checkOut)}.` },
    body: warningBox(warning) + bookingBody({ a, chosen, nights }),
    data: initialData({ a, chosen, types: ROOM_TYPES.map((t) => ({ slug: t.slug, name: t.name, photo: t.photos[0], size: t.size, bed: t.bed, view: t.view, guests: t.guests })) }),
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
  sendPrivate(req, res, { page: { title: 'As suas estadias', description: 'Reservas, hora de chegada e pedidos.' }, body: guestBody(), scripts: ['hospede'] });
});

router.get('/rececao', (req, res) => {
  sendPrivate(req, res, { page: { title: 'Painel da receção', description: 'Chegadas, saídas, reservas, pedidos e ementa.' }, body: deskBody(), scripts: ['rececao'] });
});

export default router;
