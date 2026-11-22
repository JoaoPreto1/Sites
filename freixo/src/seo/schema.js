import { MUNICIPIO, SOCIAL } from '../config/municipio.js';
import { absolute } from './head.js';
import { imgUrl } from '../views/html.js';

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'GovernmentOrganization',
  '@id': absolute('/#municipio'),
  name: MUNICIPIO.name,
  url: absolute('/'),
  logo: absolute('/img/brasao-280.webp'),
  image: absolute(imgUrl('penedo', 1600)),
  telephone: `+351 ${MUNICIPIO.phone}`,
  email: MUNICIPIO.email,
  sameAs: SOCIAL.map(([, u]) => u),
  address: { '@type': 'PostalAddress', streetAddress: MUNICIPIO.address, postalCode: MUNICIPIO.postal.split(' ')[0], addressLocality: MUNICIPIO.short, addressRegion: `Distrito de ${MUNICIPIO.district}`, addressCountry: 'PT' },
  geo: { '@type': 'GeoCoordinates', ...MUNICIPIO.geo },
  areaServed: { '@type': 'AdministrativeArea', name: `Concelho de ${MUNICIPIO.short}` },
  openingHoursSpecification: MUNICIPIO.hours.map(([, span]) => {
    const [opens, closes] = span.split('–').map((t) => t.replace('h', ':'));
    return { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens, closes };
  }),
});

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: MUNICIPIO.name,
  url: absolute('/'),
  inLanguage: 'pt-PT',
  potentialAction: { '@type': 'SearchAction', target: `${absolute('/servicos')}?q={pesquisa}`, 'query-input': 'required name=pesquisa' },
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

export const article = (n) => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: n.title,
  description: n.summary,
  image: [absolute(imgUrl(n.photo, 1600))],
  datePublished: n.date,
  dateModified: n.updatedAt ?? n.date,
  mainEntityOfPage: absolute(`/atualidade/${n.slug}`),
  author: { '@id': absolute('/#municipio') },
  publisher: { '@id': absolute('/#municipio') },
});

export const eventList = (events) =>
  events.map((e) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title,
    startDate: e.date,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: e.place.split(' · ')[0], address: { '@type': 'PostalAddress', addressLocality: MUNICIPIO.short, addressCountry: 'PT' } },
    organizer: { '@id': absolute('/#municipio') },
  }));

export const serviceCatalog = (services) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Serviços municipais',
  itemListElement: services.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: { '@type': 'GovernmentService', name: s.title, description: s.sub, provider: { '@id': absolute('/#municipio') }, url: absolute(`/servicos#${s.slug}`) },
  })),
});

export const touristPlaces = (places) =>
  places.map(([name, key, description]) => ({
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name,
    description,
    image: absolute(imgUrl(key, 960)),
    containedInPlace: { '@type': 'City', name: MUNICIPIO.short },
  }));
