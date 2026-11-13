import { absolute } from './head.js';
import { photoUrl } from './images.js';

const address = {
  '@type': 'PostalAddress',
  streetAddress: 'Rua de Cedofeita 212',
  postalCode: '4050-174',
  addressLocality: 'Porto',
  addressCountry: 'PT',
};

export const store = () => ({
  '@context': 'https://schema.org',
  '@type': 'LiquorStore',
  '@id': absolute('/#loja'),
  name: 'Cepa',
  description: 'Garrafeira no Porto com vinhos portugueses de pequenos produtores, clube de subscrição mensal e provas.',
  url: absolute('/'),
  logo: absolute('/favicon.svg'),
  image: photoUrl('https://images.unsplash.com/photo-1767465837851-d438c6ea474b', 1200, 0.75),
  email: 'ola@cepa.pt',
  telephone: '+351 222 000 212',
  address,
  geo: { '@type': 'GeoCoordinates', latitude: 41.1546, longitude: -8.6198 },
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '11:00', closes: '20:00' }],
  priceRange: '€€',
  currenciesAccepted: 'EUR',
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

export function productSchema(wine, producer) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: wine.year ? `${wine.name} ${wine.year}` : wine.name,
    description: wine.notes,
    category: `Vinho ${wine.typeName.toLowerCase()}`,
    brand: { '@type': 'Brand', name: producer.name },
    url: absolute(`/carta/${wine.slug}`),
    image: absolute(`/carta/${wine.slug}/garrafa.svg`),
    countryOfOrigin: 'PT',
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Região', value: wine.regionName },
      { '@type': 'PropertyValue', name: 'Castas', value: wine.grapes.join(', ') },
      { '@type': 'PropertyValue', name: 'Álcool', value: `${wine.alcohol}%` },
    ],
    offers: {
      '@type': 'Offer',
      price: wine.price.toFixed(2),
      priceCurrency: 'EUR',
      availability: wine.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: absolute(`/carta/${wine.slug}`),
      seller: { '@id': absolute('/#loja') },
    },
  };
}

export const eventSchema = (t) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: `Prova: ${t.title}`,
  description: t.description,
  startDate: `${t.date}T${t.time}:00+00:00`,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  image: photoUrl(t.photo, 1200, 0.75),
  location: { '@type': 'Place', name: 'Cepa', address },
  organizer: { '@id': absolute('/#loja') },
  offers: {
    '@type': 'Offer',
    price: t.price,
    priceCurrency: 'EUR',
    availability: t.seatsLeft ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    url: absolute(`/provas#${t.slug}`),
  },
});
