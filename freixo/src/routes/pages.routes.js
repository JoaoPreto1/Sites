import { Router } from 'express';
import { documentHtml } from '../views/document.js';
import { absolute } from '../seo/head.js';
import { article, breadcrumbs, eventList, organization, serviceCatalog, touristPlaces, website } from '../seo/schema.js';
import * as content from '../services/content.service.js';
import { deskStatus } from '../services/today.service.js';
import { srcset } from '../views/html.js';
import { homeBody } from '../views/pages/home.js';
import { municipioBody } from '../views/pages/municipio.js';
import { servicosBody } from '../views/pages/servicos.js';
import { viverBody } from '../views/pages/viver.js';
import { visitarBody } from '../views/pages/visitar.js';
import { investirBody } from '../views/pages/investir.js';
import { atualidadeBody, noticiaBody } from '../views/pages/atualidade.js';
import { contactosBody } from '../views/pages/contactos.js';
import { yearly } from '../data/seed.js';
import { imgUrl, initialData } from '../views/html.js';
import { balcaoBody, loginBody, painelBody } from '../views/pages/private.js';
import { SERVICE_CATEGORIES } from '../config/municipio.js';

export function send(req, res, { status = 200, ...view }) {
  res.status(status).type('html').set('Cache-Control', 'no-cache').send(documentHtml({ ...view, path: req.path }));
}

export function notFoundPage(req, res) {
  send(req, res, {
    status: 404,
    page: { title: 'Página não encontrada', description: 'A página que procura não existe.', noindex: true },
    body: `<section class="phero"><div class="wrap"><h1>Esta página <i>não existe</i></h1><p>Pode ter mudado de sítio. Experimente a pesquisa ou volte ao início.</p></div></section>`,
  });
}

const heroPreload = (key) => [{ srcset: srcset(key), sizes: '100vw' }];

const router = Router();

router.get('/robots.txt', (req, res) => {
  res.type('text').send(['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /balcao', 'Disallow: /painel', 'Disallow: /entrar', '', `Sitemap: ${absolute('/sitemap.xml')}`].join('\n'));
});

router.get('/sitemap.xml', async (req, res) => {
  const news = await content.listNews();
  const paths = ['/', '/municipio', '/servicos', '/viver', '/visitar', '/investir', '/atualidade', ...news.map((n) => `/atualidade/${n.slug}`), '/contactos'];
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${absolute(p)}</loc></url>`).join('\n')}
</urlset>`,
  );
});

router.get('/', async (req, res) => {
  const [news, events, notices, editais] = await Promise.all([content.listNews(), content.listEvents(), content.listNotices(), content.listEditais()]);
  send(req, res, {
    page: {
      description: 'Site do Município de Freixo de Espada à Cinta: Balcão Online, serviços, notícias e agenda, viver no concelho e visitar a vila manuelina do Douro Internacional.',
      schema: [organization(), website(), ...eventList(events.slice(0, 4))],
      preload: heroPreload('penedo'),
    },
    body: homeBody({ news, events, notices, editais, desk: deskStatus() }),
  });
});

router.get('/municipio', (req, res) => {
  send(req, res, {
    page: {
      title: 'Município',
      description: 'Câmara Municipal, Assembleia Municipal, as quatro freguesias, a história dos forais, o brasão e as lendas do nome, e os documentos de transparência do Município.',
      image: '/img/vila-1600.webp',
      schema: [breadcrumbs([['Início', '/'], ['Município', '/municipio']])],
      preload: heroPreload('vila'),
    },
    body: municipioBody(),
  });
});

router.get('/servicos', async (req, res) => {
  const services = await content.listServices();
  const cat = SERVICE_CATEGORIES.find(([v]) => v === req.query.categoria)?.[0];
  const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : '';
  send(req, res, {
    page: {
      title: 'Serviços',
      description: 'Todos os serviços do Município de Freixo de Espada à Cinta: água, obras, ação social, educação e atendimento. O que precisa, quanto demora e se pode tratar online.',
      path: '/servicos',
      schema: [serviceCatalog(services), breadcrumbs([['Início', '/'], ['Serviços', '/servicos']])],
      preload: heroPreload('penedo'),
    },
    body: servicosBody({ services, cat, q }),
    scripts: ['servicos'],
  });
});

router.get('/viver', (req, res) => {
  send(req, res, {
    page: {
      title: 'Viver no concelho',
      description: 'Guia para viver em Freixo de Espada à Cinta: apoios à fixação, habitação, escolas, saúde, apoio social, transporte a pedido e como chegar.',
      image: '/img/amendoeiras-1280.webp',
      schema: [breadcrumbs([['Início', '/'], ['Viver', '/viver']])],
      preload: heroPreload('amendoeiras'),
    },
    body: viverBody(),
  });
});

router.get('/visitar', (req, res) => {
  send(req, res, {
    page: {
      title: 'Visitar',
      description: 'Guia do visitante de Freixo de Espada à Cinta: a Torre do Galo, a Igreja Matriz manuelina, o Penedo Durão, a Congida, a seda, as amendoeiras em flor e a Procissão dos Sete Passos.',
      image: '/img/torre-1280.webp',
      schema: [
        breadcrumbs([['Início', '/'], ['Visitar', '/visitar']]),
        ...touristPlaces([
          ['Torre do Galo', 'torre', 'Torre heptagonal do antigo castelo de Freixo de Espada à Cinta.'],
          ['Igreja Matriz de Freixo de Espada à Cinta', 'matriz', 'Igreja-salão manuelina, Monumento Nacional desde 1910.'],
          ['Miradouro do Penedo Durão', 'penedo', 'Miradouro sobre o Douro Internacional.'],
          ['Praia fluvial da Congida', 'congida', 'Praia fluvial no rio Douro, com piscina e esplanada.'],
        ]),
      ],
      preload: heroPreload('douro'),
    },
    body: visitarBody(),
  });
});

router.get('/investir', (req, res) => {
  send(req, res, {
    page: {
      title: 'Investir',
      description: 'Investir em Freixo de Espada à Cinta: setores com futuro, apoios municipais e acompanhamento do gabinete de apoio ao investidor do primeiro contacto à abertura.',
      schema: [breadcrumbs([['Início', '/'], ['Investir', '/investir']])],
      preload: heroPreload('penedo'),
    },
    body: investirBody(),
    scripts: ['forms'],
  });
});

router.get('/atualidade', async (req, res) => {
  const [news, events, notices, editais] = await Promise.all([content.listNews(), content.listEvents(), content.listNotices(), content.listEditais()]);
  send(req, res, {
    page: {
      title: 'Atualidade',
      description: 'Notícias, agenda de eventos, avisos à população e editais do Município de Freixo de Espada à Cinta.',
      image: '/img/matriz-1600.webp',
      schema: [breadcrumbs([['Início', '/'], ['Atualidade', '/atualidade']]), ...eventList(events)],
      preload: heroPreload('matriz'),
    },
    body: atualidadeBody({ news, events, yearly, notices, editais }),
    scripts: ['atualidade', 'forms'],
  });
});

router.get('/atualidade/:slug', async (req, res, next) => {
  const item = await content.findNews(req.params.slug);
  if (!item) return next();
  const others = (await content.listNews()).filter((n) => n.id !== item.id).slice(0, 3);
  send(req, res, {
    page: {
      title: item.title,
      description: item.summary,
      image: imgUrl(item.photo, 1600),
      type: 'article',
      schema: [article(item), breadcrumbs([['Início', '/'], ['Atualidade', '/atualidade'], [item.title, `/atualidade/${item.slug}`]])],
      preload: heroPreload(item.photo),
    },
    body: noticiaBody({ item, others }),
    scripts: ['atualidade'],
  });
});

router.get('/contactos', (req, res) => {
  send(req, res, {
    page: {
      title: 'Contactos',
      description: 'Contactos, horário e localização dos Paços do Concelho de Freixo de Espada à Cinta. Escreva ao Município ou reporte um problema na via pública.',
      schema: [organization(), breadcrumbs([['Início', '/'], ['Contactos', '/contactos']])],
      preload: heroPreload('vila'),
    },
    body: contactosBody(),
    scripts: ['forms'],
  });
});

const privatePage = (title, body, script, data) => async (req, res) =>
  send(req, res, {
    page: { title, description: 'Área reservada do Balcão Online do Município de Freixo de Espada à Cinta.', noindex: true },
    body: body(),
    scripts: [script],
    data: data ? initialData(await data()) : '',
  });

const onlineServices = async () => (await content.listServices()).filter((s) => s.online && !s.action).map(({ slug, title, list }) => ({ slug, title, list }));

router.get('/entrar', privatePage('Entrar no Balcão Online', loginBody, 'login'));
router.get('/balcao', privatePage('O meu balcão', balcaoBody, 'balcao', onlineServices));
router.get('/painel', privatePage('Painel da câmara', painelBody, 'painel'));

export default router;
