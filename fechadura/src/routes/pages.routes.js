import { Router } from 'express';
import { documentHtml } from '../views/document.js';
import { listRooms } from '../services/room.service.js';
import { bookingWindow, calendar, nextFree } from '../services/booking.service.js';
import { bookingBody } from '../views/pages/booking.js';
import { escapeLog, records } from '../services/ranking.service.js';
import { breadcrumbs, business, roomList, roomSchema } from '../seo/schema.js';
import { photoSrcset, photoUrl } from '../../public/js/shared/pricing.js';
import { FILTERS, HERO_SIZES, HERO_WIDTHS, roomBody, roomsBody } from '../views/pages/rooms.js';
import { homeBody } from '../views/pages/home.js';
import { notFoundBody } from '../views/pages/not-found.js';

export function send(req, res, { status = 200, ...view }) {
  res.status(status).type('html').set('Cache-Control', 'no-cache').send(documentHtml({ ...view, path: req.path }));
}

export function notFoundPage(req, res) {
  send(req, res, {
    status: 404,
    page: { title: 'Esta porta está trancada', description: 'A página que procura não existe.', noindex: true },
    body: notFoundBody(req.path),
  });
}

const router = Router();

router.get('/', async (req, res) => {
  const [rooms, best, log] = await Promise.all([listRooms(), records(), escapeLog()]);
  const extras = await Promise.all(rooms.map(async (room) => ({ next: await nextFree(room.id), record: best.get(room.id) })));

  send(req, res, {
    page: {
      description:
        'Fechadura: quatro escape rooms em Cedofeita, no Porto. Um banco de 1932, um farol apagado, um hotel com um quarto que ninguém deixou e a cave da avó. Equipas de 2 a 6 pessoas, 60 minutos.',
      schema: [business(rooms), roomList(rooms)],
    },
    body: homeBody({ rooms, extras, log }),
    scripts: ['home'],
  });
});

router.get('/salas', async (req, res) => {
  const all = await listRooms();
  const filter = FILTERS.find(([value]) => value && value === req.query.para);
  const rooms = filter ? all.filter(filter[2]) : all;
  const nexts = new Map(await Promise.all(rooms.map(async (r) => [r.id, await nextFree(r.id)])));

  send(req, res, {
    page: {
      title: filter ? `Salas: ${filter[1].toLowerCase()}` : 'As salas',
      description: `As quatro escape rooms da Fechadura, no Porto: ${all.map((r) => r.name).join(', ')}. Dificuldade, número de pessoas, idade mínima e próxima sessão livre de cada uma.`,
      path: '/salas',
      schema: [roomList(rooms), breadcrumbs([['Fechadura', '/'], ['Salas', '/salas']])],
    },
    body: roomsBody({ rooms, filter: filter?.[0], nexts }),
  });
});

router.get('/salas/:slug', async (req, res, next) => {
  const all = await listRooms();
  const room = all.find((r) => r.slug === req.params.slug);
  if (!room) return next();
  const [days, log] = await Promise.all([calendar(room.id, 14), escapeLog()]);

  send(req, res, {
    page: {
      title: `${room.name}, escape room`,
      description: `${room.tagline} Escape room de ${room.duration} minutos no Porto para ${room.players.min} a ${room.players.max} pessoas, dificuldade ${room.difficulty} em 5. Veja as sessões livres e reserve.`,
      image: photoUrl(room.photos[0].id, 1200, 630),
      schema: [roomSchema(room), breadcrumbs([['Fechadura', '/'], ['Salas', '/salas'], [room.name, `/salas/${room.slug}`]])],
      preload: [{ srcset: photoSrcset(room.photos[0].id, HERO_WIDTHS, 0.66), sizes: HERO_SIZES }],
    },
    body: roomBody({ room, calendar: days, log: { ...log.pages.find((p) => p.room.slug === room.slug), monthName: log.monthName }, others: all.filter((r) => r.id !== room.id) }),
    scripts: ['room'],
  });
});

router.get('/reservar', async (req, res) => {
  const rooms = await listRooms();
  send(req, res, {
    page: {
      title: 'Reservar uma sala',
      description: 'Reserve uma escape room na Fechadura, no Porto: escolha a sala, o dia, a hora e quantas pessoas vêm. Paga-se no fim, ao balcão, e pode cancelar até 24 horas antes.',
      schema: [breadcrumbs([['Fechadura', '/'], ['Reservar', '/reservar']])],
    },
    body: bookingBody({ rooms, window: bookingWindow() }),
    scripts: ['booking'],
  });
});

export default router;
