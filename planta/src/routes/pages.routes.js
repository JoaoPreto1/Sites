import { Router } from 'express';
import { documentHtml } from '../views/document.js';
import { absolute } from '../seo/head.js';
import { breadcrumbs, person, projectList, projectSchema, studio } from '../seo/schema.js';
import { TYPES, findPublished, listPublished } from '../services/project.service.js';
import { imgUrl, srcset } from '../views/html.js';
import { homeBody } from '../views/pages/home.js';
import { projectBody, projectsBody } from '../views/pages/projects.js';
import { aboutBody, contactBody } from '../views/pages/about.js';
import { loginBody, notFoundBody, panelBody, workBody } from '../views/pages/private.js';

export function send(req, res, { status = 200, ...view }) {
  res.status(status).type('html').set('Cache-Control', 'no-cache').send(documentHtml({ ...view, path: req.path }));
}

export function notFoundPage(req, res) {
  send(req, res, {
    status: 404,
    page: { title: 'Folha em falta', description: 'A página que procura não existe.', noindex: true },
    body: notFoundBody(req.path),
  });
}

const router = Router();

router.get('/robots.txt', (req, res) => {
  res.type('text').send(['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /obra', 'Disallow: /painel', 'Disallow: /entrar', '', `Sitemap: ${absolute('/sitemap.xml')}`].join('\n'));
});

router.get('/sitemap.xml', async (req, res) => {
  const projects = await listPublished();
  const paths = ['/', '/projetos', ...projects.map((p) => `/projetos/${p.slug}`), '/sobre', '/contactos'];
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${absolute(p)}</loc></url>`).join('\n')}
</urlset>`,
  );
});

router.get('/', async (req, res) => {
  const projects = await listPublished();
  const first = projects[0];
  send(req, res, {
    page: {
      description:
        'Leonor Castelo, arquiteta em Matosinhos e Viseu. Moradias, reabilitação de apartamentos e habitação coletiva, desenhadas à mão do primeiro esboço à entrega das chaves.',
      schema: [studio(projects), projectList(projects)],
      preload: first ? [{ srcset: srcset(first.slug, first.cover.key), sizes: '(max-width: 900px) 70vw, 300px' }] : [],
    },
    body: homeBody({ projects }),
    scripts: ['home'],
  });
});

router.get('/projetos', async (req, res) => {
  const all = await listPublished();
  const type = TYPES.find(([value]) => value === req.query.tipo)?.[0];
  const projects = type ? all.filter((p) => p.type === type) : all;
  const label = TYPES.find(([value]) => value === type)?.[1];
  send(req, res, {
    page: {
      title: label ? `Projetos: ${label.toLowerCase()}` : 'Projetos',
      description: `Projetos de arquitetura de Leonor Castelo: ${all.map((p) => p.name).join(', ')}. Moradias, reabilitação e habitação coletiva no Grande Porto e nas Beiras.`,
      path: type ? `/projetos?tipo=${type}` : '/projetos',
      schema: [projectList(projects), breadcrumbs([['Início', '/'], ['Projetos', '/projetos']])],
    },
    body: projectsBody({ projects, type }),
  });
});

router.get('/projetos/:slug', async (req, res, next) => {
  const found = await findPublished(req.params.slug);
  if (!found) return next();
  const { project } = found;
  send(req, res, {
    page: {
      title: `${project.name}, ${project.place}`,
      description: `${project.summary} ${project.name}: ${project.area} m² em ${project.place}, ${project.year}. Projeto de Leonor Castelo Arquitetura.`,
      image: imgUrl(project.slug, project.cover.key, 1600),
      type: 'article',
      schema: [projectSchema(project), breadcrumbs([['Início', '/'], ['Projetos', '/projetos'], [project.name, `/projetos/${project.slug}`]])],
      preload: [{ srcset: srcset(project.slug, project.cover.key), sizes: '(max-width: 1340px) 92vw, 1240px' }],
    },
    body: projectBody(found),
    scripts: ['project'],
  });
});

router.get('/sobre', (req, res) => {
  send(req, res, {
    page: {
      title: 'Sobre a arquiteta',
      description: 'Leonor Castelo: arquiteta formada em Coimbra, com atelier em Matosinhos desde 2016 e escritório em Viseu. Desenha cada casa à mão e acompanha a obra até ao fim.',
      schema: [person(), breadcrumbs([['Início', '/'], ['Sobre', '/sobre']])],
    },
    body: aboutBody(),
  });
});

router.get('/contactos', (req, res) => {
  send(req, res, {
    page: {
      title: 'Contactos e pedido de reunião',
      description: 'Peça uma reunião a Leonor Castelo Arquitetura: conte-nos se tem um terreno, uma casa para reabilitar ou um apartamento. Escritórios em Matosinhos e Viseu.',
      schema: [breadcrumbs([['Início', '/'], ['Contactos', '/contactos']])],
    },
    body: contactBody(),
    scripts: ['contact'],
  });
});

const privatePage = (title, body, script) => (req, res) =>
  send(req, res, { page: { title, description: 'Área reservada de Leonor Castelo Arquitetura.', noindex: true }, body: body(), scripts: [script] });

router.get('/entrar', privatePage('Área de cliente', loginBody, 'login'));
router.get('/obra', privatePage('A minha obra', workBody, 'work'));
router.get('/painel', privatePage('Painel', panelBody, 'panel'));

export default router;
