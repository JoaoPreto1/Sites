import { ROOM_TYPES, SITE } from '../config/site.js';
import { absolute } from './head.js';

const HOTEL_ID = () => absolute('/#hotel');
const address = { '@type': 'PostalAddress', addressLocality: 'Sagres', addressRegion: 'Faro', addressCountry: 'PT' };

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: absolute('/'),
  inLanguage: 'pt-PT',
  publisher: { '@id': HOTEL_ID() },
});

export const hotel = (prices) => ({
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  '@id': HOTEL_ID(),
  name: SITE.name,
  description: `${SITE.tagline}, numa casa de pescadores à beira da falésia, com restaurante e piscina de água salgada.`,
  url: absolute('/'),
  image: [absolute('/img/og.jpg'), absolute('/img/fotos/piscina-1200.webp'), absolute('/img/fotos/qmar-1200.webp')],
  logo: absolute('/icon-512.png'),
  email: SITE.email,
  address,
  numberOfRooms: 14,
  checkinTime: SITE.checkIn,
  checkoutTime: SITE.checkOut,
  petsAllowed: 'Só nos quartos Pátio',
  priceRange: `${Math.min(...Object.values(prices))} € a ${Math.max(...Object.values(prices))} € por noite`,
  currenciesAccepted: 'EUR',
  availableLanguage: ['pt-PT', 'en'],
  amenityFeature: ['Piscina de água salgada', 'Restaurante', 'Wi-Fi gratuito', 'Estacionamento gratuito', 'Bicicletas', 'Receção 24 horas'].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
  containsPlace: ROOM_TYPES.map((t) => ({ '@type': 'HotelRoom', name: t.name, url: absolute(`/quartos/${t.slug}`) })),
});

export const hotelRoom = (t, price) => ({
  '@context': 'https://schema.org',
  '@type': 'HotelRoom',
  name: `Quarto ${t.name}`,
  description: `${t.lead} ${t.text}`,
  url: absolute(`/quartos/${t.slug}`),
  image: t.photos.map((p) => absolute(`/img/fotos/${p}-1200.webp`)),
  floorSize: { '@type': 'QuantitativeValue', value: t.size, unitCode: 'MTK' },
  bed: t.bed,
  occupancy: { '@type': 'QuantitativeValue', maxValue: t.guests },
  petsAllowed: Boolean(t.pets),
  containedInPlace: { '@id': HOTEL_ID() },
  offers: { '@type': 'Offer', price, priceCurrency: 'EUR', unitText: 'noite', url: absolute(`/quartos/${t.slug}`) },
});

export const restaurant = (menu) => ({
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: `Restaurante do ${SITE.name}`,
  url: absolute('/restaurante'),
  servesCuisine: ['Portuguesa', 'Peixe e marisco'],
  address,
  containedInPlace: { '@id': HOTEL_ID() },
  acceptsReservations: true,
  openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '19:30', closes: '22:30' },
  hasMenu: menu && {
    '@type': 'Menu',
    name: 'Ementa do dia',
    hasMenuItem: menu.items.map((i) => ({ '@type': 'MenuItem', name: i.name, description: i.detail, offers: { '@type': 'Offer', price: i.price, priceCurrency: 'EUR' } })),
  },
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

export const itemList = (name, items) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  itemListElement: items.map(([label, path], i) => ({ '@type': 'ListItem', position: i + 1, name: label, url: absolute(path) })),
});

export const aboutPage = (path, name) => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `${name} · ${SITE.name}`,
  url: absolute(path),
  about: { '@id': HOTEL_ID() },
});
