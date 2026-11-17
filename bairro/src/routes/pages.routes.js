import { Router } from 'express';
import { photoSrcset } from '../../public/js/shared/format.js';
import { featuredProject } from '../services/project.service.js';
import { listTeam, nextOpening } from '../services/studio.service.js';
import { studio } from '../seo/schema.js';
import { documentHtml } from '../views/document.js';
import { FEATURED_SIZES, FEATURED_WIDTHS, homeSticky, homeWindows } from '../views/pages/home.js';
import { notFoundWindows } from '../views/pages/not-found.js';

export async function send(req, res, { status = 200, ...view }) {
  const opening = await nextOpening();
  res
    .status(status)
    .type('html')
    .set('Cache-Control', 'no-cache')
    .send(documentHtml({ ...view, opening, path: req.path }));
}

export async function notFoundPage(req, res) {
  await send(req, res, {
    status: 404,
    page: { title: 'Ficheiro não encontrado', description: 'Esta página não existe.', noindex: true },
    windows: notFoundWindows(req.path),
  });
}

const router = Router();

router.get('/', async (req, res) => {
  const [team, project, opening] = await Promise.all([listTeam(), featuredProject(), nextOpening()]);
  const cover = project.images[0].photo;

  await send(req, res, {
    page: {
      description:
        'Bairro é um estúdio de design no Porto com três pessoas e um gato. Fazemos marcas, sites, embalagens e cartazes para negócios pequenos. Veja os projetos e peça orçamento.',
      schema: [studio(team)],
      preload: [{ srcset: photoSrcset(cover, FEATURED_WIDTHS, 0.56), sizes: FEATURED_SIZES }],
    },
    windows: homeWindows({ team, project, opening }),
    extra: homeSticky(),
    deskHeight: 1280,
  });
});

export default router;
