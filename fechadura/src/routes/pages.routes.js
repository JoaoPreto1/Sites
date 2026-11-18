import { Router } from 'express';
import { documentHtml } from '../views/document.js';
import { listRooms } from '../services/room.service.js';
import { nextFree } from '../services/booking.service.js';
import { escapeLog, records } from '../services/ranking.service.js';
import { breadcrumbs, business, roomList } from '../seo/schema.js';
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

export default router;
