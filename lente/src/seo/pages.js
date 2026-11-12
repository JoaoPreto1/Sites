import { absolute } from './head.js';
import { photoUrl, srcset } from './images.js';

// Têm de ser iguais aos usados no frontend (public/js/utils.js) para o preload ser aproveitado
export const WORK_WIDTHS = [400, 600, 800, 1000, 1200];
export const WORK_RATIO = 1.25;
export const FEATURED_SIZES = '(max-width: 860px) 100vw, 50vw';
export const GRID_SIZES = '(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw';
export const COVER_WIDTHS = [640, 960, 1280, 1600, 2000];
export const COVER_RATIO = 0.65;
const HERO = 'https://images.unsplash.com/photo-1595550891383-152fbed0f9bc';

const address = {
  '@type': 'PostalAddress',
  streetAddress: 'Rua do Almada 300',
  postalCode: '4050-032',
  addressLocality: 'Porto',
  addressCountry: 'PT',
};

export const studio = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': absolute('/#estudio'),
  name: 'Lente Studio',
  description: 'Estúdio de fotografia e vídeo no Porto para marcas de moda, música, editorial e hotelaria.',
  url: absolute('/'),
  logo: absolute('/favicon.svg'),
  image: photoUrl('https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea', 1200, 0.75),
  email: 'ola@lente.studio',
  telephone: '+351 220 000 000',
  address,
  geo: { '@type': 'GeoCoordinates', latitude: 41.1496, longitude: -8.6109 },
  openingHours: 'Mo-Fr 10:00-19:00',
  priceRange: '€€',
  foundingDate: '2014',
  areaServed: 'PT',
  sameAs: ['https://www.instagram.com/', 'https://vimeo.com/', 'https://www.behance.net/'],
});

const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

const faq = [
  ['Com quanta antecedência devo marcar?', 'Para campanhas, quatro a seis semanas. Para sessões de estúdio ou retrato, às vezes conseguimos na mesma semana.'],
  ['Os direitos das imagens estão incluídos?', 'Sim, para uso digital e em loja durante dois anos. Publicidade exterior, televisão ou uso internacional são orçamentados à parte.'],
  ['Trabalham fora do Porto?', 'Sim, em todo o país e no estrangeiro. As deslocações e estadias da equipa são incluídas na proposta.'],
  ['Como recebo as fotografias?', 'Numa galeria privada na nossa área de cliente, com login. Escolhe as favoritas, nós retocamos e depois descarrega tudo em alta resolução.'],
  ['Como funciona o pagamento?', '50% na adjudicação e 50% na entrega final. Emitimos fatura com NIF em todos os projetos.'],
];

export function staticPages({ featured = [], projects = [], services = [] } = {}) {
  return {
    '/': {
      file: 'index',
      description: 'Estúdio de fotografia e vídeo no Porto para marcas de moda, música e editorial. Campanhas, lookbooks, capas de álbum e galerias privadas para clientes.',
      preload: [{ srcset: srcset(HERO, [640, 960, 1280, 1920, 2400], 0.62, 70), sizes: '100vw' }],
      schema: [studio(), { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Lente Studio', url: absolute('/'), inLanguage: 'pt-PT' }],
    },
    '/trabalho': {
      file: 'trabalho',
      preload: projects[0] ? [{ srcset: srcset(projects[0].cover, WORK_WIDTHS, WORK_RATIO), sizes: GRID_SIZES }] : [],
      title: 'Trabalho: moda, música, editorial e marcas',
      description: 'Portefólio do Lente Studio: campanhas de moda, capas de álbum, editoriais, still life e hotelaria fotografados no Porto e em todo o país.',
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Trabalho — Lente Studio',
          url: absolute('/trabalho'),
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(`/trabalho/${p.slug}`), name: p.title })),
          },
        },
        breadcrumbs([['Início', '/'], ['Trabalho', '/trabalho']]),
      ],
    },
    '/servicos': {
      file: 'servicos',
      title: 'Serviços e preços de fotografia e vídeo',
      description: 'Fotografia desde 900 € por dia, vídeo, direção de arte e retoque. Veja como trabalhamos, os preços de referência e o aluguer do estúdio no Porto.',
      schema: [
        ...services.map((s) => ({
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: s.name,
          description: s.summary,
          provider: { '@id': absolute('/#estudio') },
          areaServed: 'PT',
          offers: { '@type': 'Offer', priceCurrency: 'EUR', price: s.from, description: `Desde ${s.from} € ${s.unit}` },
        })),
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
        },
        breadcrumbs([['Início', '/'], ['Serviços', '/servicos']]),
      ],
    },
    '/estudio': {
      file: 'estudio',
      title: 'O estúdio, a equipa e o espaço',
      description: 'Quatro pessoas e 220 m² de estúdio com ciclorama na Rua do Almada, no Porto. Conheça a equipa, o espaço e o equipamento do Lente Studio.',
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          url: absolute('/estudio'),
          about: {
            ...studio(),
            employee: [
              ['Tomás Reis', 'Fundador e fotógrafo'],
              ['Inês Lobo', 'Vídeo e realização'],
              ['Duarte Faria', 'Direção de arte'],
              ['Marta Sá', 'Produção e retoque'],
            ].map(([name, jobTitle]) => ({ '@type': 'Person', name, jobTitle })),
          },
        },
        breadcrumbs([['Início', '/'], ['Estúdio', '/estudio']]),
      ],
    },
    '/orcamento': {
      file: 'orcamento',
      title: 'Pedir orçamento',
      description: 'Conte-nos o seu projeto de fotografia ou vídeo e receba uma proposta com moodboard, equipa e preço fechado em até dois dias úteis.',
      schema: [{ '@context': 'https://schema.org', '@type': 'ContactPage', url: absolute('/orcamento'), about: { '@id': absolute('/#estudio') } }, studio()],
    },
    '/entrar': { file: 'entrar', title: 'Área de cliente', description: 'Entre na área de cliente para ver as suas galerias privadas.', noindex: true },
    '/galerias': { file: 'galerias', title: 'As minhas galerias', description: 'As suas galerias privadas no Lente Studio.', noindex: true },
    '/painel': { file: 'painel', title: 'Painel do estúdio', description: 'Painel de gestão do Lente Studio.', noindex: true },
  };
}

export function projectPage(project, next) {
  const path = `/trabalho/${project.slug}`;
  const images = [project.cover, ...project.gallery];

  return {
    file: 'projeto',
    path,
    title: `${project.title} — ${project.category} para ${project.client}`,
    description: `${project.summary} ${project.description}`.slice(0, 158).replace(/\s\S*$/, '…'),
    image: photoUrl(project.cover, 1200, 0.525),
    type: 'article',
    preload: [{ srcset: srcset(project.cover, COVER_WIDTHS, COVER_RATIO), sizes: '100vw' }],
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        '@id': absolute(path),
        name: project.title,
        headline: project.title,
        description: project.description,
        url: absolute(path),
        image: images.map((url) => photoUrl(url, 1200, 0.75)),
        dateCreated: String(project.year),
        genre: project.category,
        locationCreated: { '@type': 'Place', name: project.location },
        creator: { '@id': absolute('/#estudio') },
        sourceOrganization: { '@type': 'Organization', name: project.client },
        contributor: project.team.map((member) => ({ '@type': 'Person', name: member.split(' — ')[0], jobTitle: member.split(' — ')[1] })),
        keywords: project.services.join(', '),
      },
      breadcrumbs([['Início', '/'], ['Trabalho', '/trabalho'], [project.title, path]]),
    ],
    next,
  };
}
