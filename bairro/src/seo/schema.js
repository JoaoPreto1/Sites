import { STUDIO } from '../config/studio.js';
import { SERVICES } from '../../public/js/shared/estimate.js';
import { photoUrl } from '../../public/js/shared/format.js';
import { absolute } from './head.js';

export const studio = (team = []) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': absolute('/#estudio'),
  name: 'Bairro',
  description: 'Estúdio de design no Porto: marcas, sites, embalagens e cartazes para negócios pequenos.',
  url: absolute('/'),
  logo: absolute('/favicon.svg'),
  image: photoUrl('1759975142115-23f8862b6748', 1200),
  email: STUDIO.email,
  telephone: STUDIO.phone,
  priceRange: '€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: STUDIO.street,
    postalCode: STUDIO.postalCode,
    addressLocality: STUDIO.city,
    addressCountry: 'PT',
  },
  geo: { '@type': 'GeoCoordinates', ...STUDIO.geo },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:30', closes: '18:30' },
  ],
  areaServed: 'Portugal',
  knowsAbout: ['Design de marca', 'Design de embalagem', 'Design de sites', 'Tipografia', 'Ilustração'],
  employee: team.map((p) => ({ '@type': 'Person', name: p.name, jobTitle: p.role })),
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

export const projectList = (projects) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(`/projetos/${p.slug}`), name: p.title })),
});

export const projectSchema = (project) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: project.title,
  description: project.summary,
  url: absolute(`/projetos/${project.slug}`),
  image: project.images.map((img) => photoUrl(img.photo, 1200)),
  dateCreated: String(project.year),
  genre: project.categoryName,
  keywords: project.services.join(', '),
  creator: { '@id': absolute('/#estudio') },
  sourceOrganization: { '@type': 'Organization', name: project.client },
  locationCreated: { '@type': 'Place', name: project.place },
});

export const serviceCatalog = () => ({
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: 'Serviços e preços do estúdio Bairro',
  itemListElement: SERVICES.map((s) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: s.name, description: s.detail, provider: { '@id': absolute('/#estudio') } },
    priceSpecification: { '@type': 'PriceSpecification', minPrice: s.min, maxPrice: s.max, priceCurrency: 'EUR' },
  })),
});

export const teamPage = (team) => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Equipa do estúdio Bairro',
  url: absolute('/equipa'),
  about: { '@id': absolute('/#estudio') },
  mainEntity: team.map((p) => ({ '@type': 'Person', name: p.name, jobTitle: p.role, description: p.bio, image: photoUrl(p.photo, 400, 1) })),
});

export const faqSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
