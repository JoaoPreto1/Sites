import { SERVICES, SITE } from '../config/site.js';
import { absolute } from './head.js';

const ORG_ID = () => absolute('/#estudio');

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: absolute('/'),
  inLanguage: 'pt-PT',
  description: `${SITE.tagline} em ${SITE.city}`,
  publisher: { '@id': ORG_ID() },
});

// Estúdio de design: ProfessionalService com os cinco serviços no catálogo
export const studio = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': ORG_ID(),
  name: SITE.name,
  description: `${SITE.tagline}. Marcas, sites, movimento, rótulos e livros.`,
  url: absolute('/'),
  logo: absolute('/icon-512.png'),
  image: absolute('/img/og.png'),
  email: SITE.email,
  address: { '@type': 'PostalAddress', addressLocality: 'Lisboa', addressRegion: 'Lisboa', addressCountry: 'PT' },
  areaServed: { '@type': 'Country', name: 'Portugal' },
  openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Serviços',
    itemListElement: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.lead, url: absolute(`/servicos/${s.slug}`) } })),
  },
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

export const service = (s) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: s.name,
  serviceType: s.name,
  description: s.lead,
  url: absolute(`/servicos/${s.slug}`),
  provider: { '@id': ORG_ID() },
  areaServed: { '@type': 'Country', name: 'Portugal' },
});

export const creativeWork = (w) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: w.title,
  headline: w.title,
  description: w.summary,
  url: absolute(`/trabalhos/${w.slug}`),
  image: absolute(`${w.cover}-1200.webp`),
  dateCreated: String(w.year),
  datePublished: w.publishedAt,
  genre: w.categoryLabel,
  inLanguage: 'pt-PT',
  creator: { '@id': ORG_ID() },
  sourceOrganization: { '@type': 'Organization', name: w.client },
});

export const itemList = (name, items) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  itemListElement: items.map(([label, path], i) => ({ '@type': 'ListItem', position: i + 1, name: label, url: absolute(path) })),
});

export const article = (e) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: e.title,
  description: e.excerpt,
  url: absolute(`/diario/${e.slug}`),
  datePublished: e.publishedAt,
  dateModified: e.updatedAt ?? e.publishedAt,
  inLanguage: 'pt-PT',
  author: { '@type': 'Person', name: e.author },
  publisher: { '@id': ORG_ID() },
  image: absolute('/img/og.png'),
});

export const contactPage = () => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Contacto · ${SITE.name}`,
  url: absolute('/contacto'),
  about: { '@id': ORG_ID() },
});

export const aboutPage = () => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `Estúdio · ${SITE.name}`,
  url: absolute('/estudio'),
  about: { '@id': ORG_ID() },
});
