import { cover } from '../../public/js/shared/format.js';
import { absolute } from './head.js';

export const ADDRESS = {
  street: 'Rua dos Anjos 58',
  postalCode: '1150-039',
  city: 'Lisboa',
  phone: '+351 218 000 058',
  phoneLabel: '218 000 058',
  email: 'loja@rotacao.pt',
};

const address = {
  '@type': 'PostalAddress',
  streetAddress: ADDRESS.street,
  postalCode: ADDRESS.postalCode,
  addressLocality: ADDRESS.city,
  addressCountry: 'PT',
};

export const store = () => ({
  '@context': 'https://schema.org',
  '@type': 'MusicStore',
  '@id': absolute('/#loja'),
  name: 'Rotação',
  description: 'Loja de discos de vinil novos e usados em Lisboa, com pré-escuta de cada disco e três salas de ensaio no piso de baixo.',
  url: absolute('/'),
  logo: absolute('/favicon.svg'),
  image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=1200&q=75&auto=format&fit=crop',
  email: ADDRESS.email,
  telephone: ADDRESS.phone,
  address,
  geo: { '@type': 'GeoCoordinates', latitude: 38.7246, longitude: -9.1356 },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '11:00', closes: '20:00' },
  ],
  priceRange: '€€',
  currenciesAccepted: 'EUR',
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

export function albumSchema(record) {
  const url = absolute(`/discos/${record.id}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${record.artist} — ${record.title}`,
    description: record.note,
    image: cover(record, 1000),
    url,
    category: `Disco de vinil · ${record.crateName}`,
    brand: { '@type': 'Brand', name: record.label },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Ano', value: String(record.year) },
      { '@type': 'PropertyValue', name: 'Prensagem', value: record.pressing },
      { '@type': 'PropertyValue', name: 'Estado do disco', value: record.media },
      { '@type': 'PropertyValue', name: 'Estado da capa', value: record.sleeve },
    ],
    subjectOf: {
      '@type': 'MusicAlbum',
      name: record.title,
      byArtist: { '@type': 'MusicGroup', name: record.artist },
      datePublished: String(record.year),
      numTracks: record.tracks.length,
      track: record.tracks.slice(0, 20).map((t, i) => ({ '@type': 'MusicRecording', position: i + 1, name: t.title })),
    },
    offers: {
      '@type': 'Offer',
      price: record.price.toFixed(2),
      priceCurrency: 'EUR',
      itemCondition: record.media === 'M' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      availability: record.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
      seller: { '@id': absolute('/#loja') },
    },
  };
}

export const faqSchema = (questions) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

export const roomsSchema = (rooms) =>
  rooms.map((room) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${room.name} · sala de ensaio`,
    description: `${room.size} m², até ${room.capacity} pessoas. ${room.gear.join(', ')}.`,
    provider: { '@id': absolute('/#loja') },
    areaServed: 'Lisboa',
    offers: { '@type': 'Offer', price: room.price.toFixed(2), priceCurrency: 'EUR', unitText: 'hora', url: absolute('/salas') },
  }));
