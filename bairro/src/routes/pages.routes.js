import { Router } from 'express';
import { photoSrcset, photoUrl } from '../../public/js/shared/format.js';
import { categoryCounts, featuredProject, listProjects, projectDetail } from '../services/project.service.js';
import { listAvailability, listTeam, nextOpening } from '../services/studio.service.js';
import { EXTRAS, SERVICES } from '../../public/js/shared/estimate.js';
import { lisbonToday } from '../utils/dates.js';
import { breadcrumbs, faqSchema, howTo, projectList, projectSchema, serviceCatalog, studio, teamPage } from '../seo/schema.js';
import { teamWindows } from '../views/pages/team.js';
import { FAQ, pricesWindows } from '../views/pages/prices.js';
import { quoteWindows } from '../views/pages/quote.js';
import { processWindows, STEPS } from '../views/pages/process.js';
import { manifestoWindows, settingsWindows, trashWindows } from '../views/pages/extras.js';
import { accountWindows, adminWindows, loginWindows } from '../views/pages/private.js';
import { absolute } from '../seo/head.js';
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
    deskHeight: 1320,
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
      preload: [{ srcset: photoSrcset(first.photo, [480, 760, 1000, 1400], 0.66), sizes: '(min-width: 1200px) 700px, (min-width: 1024px) 60vw, 100vw' }],
    },
    windows: projectWindows(project),
  });
});

router.get('/equipa', async (req, res) => {
  const [team, months] = await Promise.all([listTeam(), listAvailability()]);
  await send(req, res, {
    page: {
      title: 'Equipa e vagas',
      description: 'Hugo, Leonor e Marta: três designers num segundo andar da Rua do Almada, no Porto, mais o gato Pixel. Veja quem somos e quando há vagas para começar.',
      schema: [teamPage(team), breadcrumbs([['Bairro', '/'], ['Equipa', '/equipa']])],
    },
    windows: teamWindows({ team, months }),
  });
});

router.get('/processo', async (req, res) => {
  await send(req, res, {
    page: {
      title: 'Como trabalhamos',
      description: 'Seis passos entre a primeira conversa e a entrega: pesquisa, esboços aplicados a peças reais, proposta impressa em tamanho real, afinação e 30 dias de apoio.',
      schema: [howTo(STEPS), breadcrumbs([['Bairro', '/'], ['Como trabalhamos', '/processo']])],
    },
    windows: processWindows(),
  });
});

router.get('/precos', async (req, res) => {
  await send(req, res, {
    page: {
      title: 'Preços de design de marca, sites e embalagem',
      description: `Preços de referência do estúdio Bairro: marca desde ${SERVICES[0].min} €, site desde ${SERVICES[1].min} €, embalagem desde ${SERVICES[3].min} €. Calcule uma estimativa e peça orçamento.`,
      schema: [serviceCatalog(), faqSchema(FAQ), breadcrumbs([['Bairro', '/'], ['Preços', '/precos']])],
    },
    windows: pricesWindows(),
  });
});

const fromQuery = (value, allowed) =>
  String(value ?? '')
    .split(',')
    .filter((id) => allowed.includes(id));

router.get('/orcamento', async (req, res) => {
  await send(req, res, {
    page: {
      title: 'Pedir orçamento',
      description: 'Conte-nos o que precisa: marca, site, embalagem ou cartazes. Respondemos em menos de dois dias úteis com uma conversa de 30 minutos sem custos.',
      path: '/orcamento',
      schema: [breadcrumbs([['Bairro', '/'], ['Pedir orçamento', '/orcamento']])],
    },
    windows: quoteWindows({
      services: fromQuery(req.query.servicos, SERVICES.map((s) => s.id)),
      extras: fromQuery(req.query.extras, EXTRAS.map((e) => e.id)),
      today: lisbonToday(),
    }),
  });
});

router.get('/manifesto', async (req, res) => {
  await send(req, res, {
    page: {
      title: 'Manifesto',
      description: 'Oito regras do estúdio Bairro: desenhar para quem vende, poucos projetos de cada vez, preços às claras, tudo testado em papel e o gato tem sempre razão.',
      type: 'article',
      schema: [breadcrumbs([['Bairro', '/'], ['Manifesto', '/manifesto']])],
    },
    windows: manifestoWindows(),
  });
});

router.get('/lixo', async (req, res) => {
  await send(req, res, {
    page: {
      title: 'Ideias más',
      description: 'O caixote do lixo do estúdio: logótipos em Comic Sans, sites com música de fundo e outras ideias que nunca saíram da primeira reunião.',
    },
    windows: trashWindows(),
  });
});

router.get('/definicoes', async (req, res) => {
  await send(req, res, {
    page: { title: 'Definições', description: 'Mude a cor e o padrão do fundo do ambiente de trabalho.', noindex: true },
    windows: settingsWindows(),
  });
});

const privatePage = (title) => ({ title, description: 'Área reservada a clientes e à equipa do estúdio Bairro.', noindex: true });

router.get('/entrar', async (req, res) => {
  const email = typeof req.query.email === 'string' ? req.query.email.slice(0, 120) : '';
  await send(req, res, { page: privatePage('Área de cliente'), windows: loginWindows({ email, register: req.query.registar === '1' }) });
});

router.get('/conta', async (req, res) => {
  await send(req, res, { page: privatePage('O meu projeto'), windows: accountWindows() });
});

router.get('/painel', async (req, res) => {
  await send(req, res, { page: privatePage('Gestor de tarefas'), windows: adminWindows() });
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /api/\nDisallow: /conta\nDisallow: /painel\nDisallow: /entrar\nDisallow: /definicoes\n\nSitemap: ${absolute('/sitemap.xml')}\n`);
});

router.get('/sitemap.xml', async (req, res) => {
  const [projects, categories] = await Promise.all([listProjects(), categoryCounts()]);
  const today = lisbonToday();
  const urls = [
    ['/', '1.0'],
    ['/projetos', '0.9'],
    ...categories.filter((c) => c.count).map((c) => [`/projetos?categoria=${c.slug}`, '0.6']),
    ...projects.map((p) => [`/projetos/${p.slug}`, '0.8']),
    ['/equipa', '0.7'],
    ['/processo', '0.7'],
    ['/precos', '0.8'],
    ['/orcamento', '0.7'],
    ['/manifesto', '0.5'],
    ['/lixo', '0.3'],
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([path, priority]) => `  <url><loc>${absolute(path).replace(/&/g, '&amp;')}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`).join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
});

export default router;
