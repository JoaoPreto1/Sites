import { STUDIO } from '../config/studio.js';
import { absolute } from './head.js';
import { imgUrl } from '../views/html.js';

const office = (o) => ({
  '@type': 'Place',
  name: `${STUDIO.brand} · ${o.city}`,
  address: { '@type': 'PostalAddress', streetAddress: o.street, postalCode: o.postalCode, addressLocality: o.city, addressCountry: 'PT' },
  geo: { '@type': 'GeoCoordinates', ...o.geo },
});

export const studio = (projects = []) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': absolute('/#atelier'),
  name: STUDIO.brand,
  description: 'Atelier de arquitetura em Matosinhos e Viseu: moradias, reabilitação e habitação coletiva, do primeiro esboço à entrega das chaves.',
  url: absolute('/'),
  logo: absolute('/favicon.svg'),
  image: absolute(imgUrl('casa-em-silvalde', 'logradouro', 1600)),
  email: STUDIO.email,
  telephone: STUDIO.phone,
  foundingDate: String(STUDIO.since),
  founder: { '@type': 'Person', name: STUDIO.name, jobTitle: 'Arquiteta' },
  address: office(STUDIO.offices[0]).address,
  location: STUDIO.offices.map(office),
  areaServed: ['Grande Porto', 'Viseu', 'Beiras', 'Minho'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Projetos',
    itemListElement: projects.map((p) => ({ '@type': 'CreativeWork', name: p.name, url: absolute(`/projetos/${p.slug}`) })),
  },
});

export const projectList = (projects) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(`/projetos/${p.slug}`), name: p.name })),
});

export const projectSchema = (p) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: p.name,
  description: p.summary,
  url: absolute(`/projetos/${p.slug}`),
  image: p.photos.map((ph) => absolute(imgUrl(p.slug, ph.key, 1600))),
  dateCreated: String(p.year),
  locationCreated: { '@type': 'Place', name: p.place },
  creator: { '@id': absolute('/#atelier') },
  keywords: p.tags.join(', '),
});

export const person = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: STUDIO.name,
  jobTitle: 'Arquiteta',
  worksFor: { '@id': absolute('/#atelier') },
  alumniOf: 'Departamento de Arquitetura da Universidade de Coimbra',
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});
