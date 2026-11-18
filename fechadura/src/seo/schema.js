import { VENUE } from '../config/venue.js';
import { PER_PERSON, photoUrl } from '../../public/js/shared/pricing.js';
import { absolute } from './head.js';

const prices = Object.values(PER_PERSON);

export const business = (rooms = []) => ({
  '@context': 'https://schema.org',
  '@type': 'EntertainmentBusiness',
  '@id': absolute('/#fechadura'),
  name: 'Fechadura',
  description: 'Escape rooms em Cedofeita, no Porto: quatro salas com histórias diferentes, para equipas de 2 a 6 pessoas.',
  url: absolute('/'),
  logo: absolute('/favicon.svg'),
  image: photoUrl('1614797091730-e2a6121aaa60', 1200),
  telephone: VENUE.phone,
  email: VENUE.email,
  priceRange: `${Math.min(...prices)}–${Math.max(...prices)} € por pessoa`,
  address: { '@type': 'PostalAddress', streetAddress: VENUE.street, postalCode: VENUE.postalCode, addressLocality: VENUE.city, addressCountry: 'PT' },
  geo: { '@type': 'GeoCoordinates', ...VENUE.geo },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '17:30', closes: '23:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: '10:30', closes: '23:00' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Salas',
    itemListElement: rooms.map((r) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: r.name, url: absolute(`/salas/${r.slug}`) } })),
  },
});

export const roomList = (rooms) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: rooms.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(`/salas/${r.slug}`), name: r.name })),
});

export const roomSchema = (room) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: `${room.name} · escape room no Porto`,
  description: room.story.join(' '),
  image: room.photos.map((p) => photoUrl(p.id, 1200)),
  brand: { '@type': 'Brand', name: 'Fechadura' },
  url: absolute(`/salas/${room.slug}`),
  additionalProperty: [
    { '@type': 'PropertyValue', name: 'Jogadores', value: `${room.players.min} a ${room.players.max}` },
    { '@type': 'PropertyValue', name: 'Duração', value: `${room.duration} minutos` },
    { '@type': 'PropertyValue', name: 'Dificuldade', value: `${room.difficulty} em 5` },
    { '@type': 'PropertyValue', name: 'Idade mínima', value: `${room.minAge} anos` },
  ],
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    offerCount: Object.keys(PER_PERSON).length,
    availability: 'https://schema.org/InStock',
    url: absolute(`/reservar?sala=${room.slug}`),
  },
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

export const faqSchema = (faq) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
