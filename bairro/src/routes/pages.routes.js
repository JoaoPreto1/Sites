import { Router } from 'express';
import { photoSrcset, photoUrl } from '../../public/js/shared/format.js';
import { categoryCounts, featuredProject, listProjects, projectDetail } from '../services/project.service.js';
import { listTeam, nextOpening } from '../services/studio.service.js';
import { breadcrumbs, projectList, projectSchema, studio } from '../seo/schema.js';
import { projectsWindows, projectWindows } from '../views/pages/projects.js';
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

router.get('/projetos', async (req, res) => {
  const categories = await categoryCounts();
  const category = categories.find((c) => c.slug === req.query.categoria);
  const projects = await listProjects({ categoria: category?.slug });
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  // Filtros desconhecidos não criam páginas novas: o canonical aponta para a lista completa
  const path = category ? `/projetos?categoria=${category.slug}` : '/projetos';

  await send(req, res, {
    page: {
      title: category ? `Projetos de ${category.name.toLowerCase()}` : 'Projetos de design',
      description: category
        ? `Projetos de ${category.name.toLowerCase()} do estúdio Bairro, no Porto: ${projects.map((p) => p.title).join(', ')}.`
        : `Portefólio do estúdio Bairro: ${total} projetos de marca, embalagem, sites e cartazes para negócios do Porto, com imagens e a história de cada um.`,
      path,
      schema: [
        projectList(projects),
        breadcrumbs([['Bairro', '/'], ['Projetos', '/projetos'], ...(category ? [[category.name, path]] : [])]),
      ],
    },
    windows: projectsWindows({ projects, categories, category, total }),
  });
});

router.get('/projetos/:slug', async (req, res, next) => {
  let project;
  try {
    project = await projectDetail(req.params.slug);
  } catch {
    return next();
  }
  const [first] = project.images;

  await send(req, res, {
    page: {
      title: `${project.title} · ${project.services.join(', ')}`,
      description: `${project.summary} ${project.services.join(', ')} para ${project.client}, ${project.place}, ${project.year}.`,
      image: photoUrl(first.photo, 1200, 0.525),
      type: 'article',
      schema: [projectSchema(project), breadcrumbs([['Bairro', '/'], ['Projetos', '/projetos'], [project.title, `/projetos/${project.slug}`]])],
      preload: [{ srcset: photoSrcset(first.photo, [480, 760, 1000, 1400], 0.66), sizes: '(min-width: 1200px) 700px, (min-width: 900px) 60vw, 100vw' }],
    },
    windows: projectWindows(project),
  });
});

export default router;
