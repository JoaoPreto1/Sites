import { absolute } from './head.js';
import { photoUrl, srcset } from './images.js';

const HERO = 'https://images.unsplash.com/photo-1560242374-cef61d4d5db6';
export const HERO_WIDTHS = [480, 720, 960, 1280, 1920, 2400];

const address = {
  '@type': 'PostalAddress',
  streetAddress: 'Rua da Barroca 12',
  postalCode: '8600-315',
  addressLocality: 'Lagos',
  addressRegion: 'Faro',
  addressCountry: 'PT',
};

export const business = () => ({
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  '@id': absolute('/#maré'),
  name: 'Maré',
  description: 'Seis casas de férias em Lagos, no Algarve, com reservas diretas e sem comissões.',
  url: absolute('/'),
  image: photoUrl(HERO, 1200, 0.525),
  telephone: '+351 282 000 000',
  email: 'ola@mare.pt',
  priceRange: '95 € – 480 € por noite',
  address,
  geo: { '@type': 'GeoCoordinates', latitude: 37.1028, longitude: -8.6730 },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: 4.9, reviewCount: 1200, bestRating: 5 },
  checkinTime: '16:00',
  checkoutTime: '11:00',
});

const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

const faq = [
  ['Quando é que pago a reserva?', 'Só depois de confirmarmos a disponibilidade. Enviamos uma referência Multibanco ou um pedido MB Way, e tem 48 horas para pagar.'],
  ['Posso cancelar?', 'Sim. O cancelamento é gratuito até 14 dias antes da entrada e pode fazê-lo na sua área pessoal. Depois disso o valor não é reembolsado.'],
  ['A que horas é o check-in e o check-out?', 'A entrada é a partir das 16h e a saída até às 11h. Se precisar de outro horário diga-nos, tentamos sempre ajustar.'],
  ['Posso levar o meu cão?', 'Na Casa do Pátio e na Vila Barlavento sim, com um suplemento de limpeza de 30 €. Peça-nos ao reservar.'],
  ['Há estacionamento?', 'Quatro das seis casas têm estacionamento privado. No centro histórico há um parque a 3 minutos a pé com desconto para hóspedes.'],
  ['Fazem preços para estadias longas?', 'Sim, a partir de 14 noites fazemos 15% de desconto fora da época alta. Fale connosco para um orçamento.'],
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
};

export const staticPages = {
  '/': {
    file: 'index',
    description: 'Seis casas de férias em Lagos, no Algarve, com vista mar, piscina ou no centro histórico. Reserve direto, sem comissões, e junte passeios à estadia.',
    preload: [{ srcset: srcset(HERO, HERO_WIDTHS, undefined, 60), sizes: '100vw' }],
    schema: () => [
      business(),
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Maré', url: absolute('/'), inLanguage: 'pt-PT' },
      faqSchema,
    ],
  },
  '/alojamentos': {
    file: 'alojamentos',
    title: 'Casas de férias em Lagos',
    description: 'Seis casas de férias em Lagos, do estúdio para dois à moradia com piscina para oito. Veja a disponibilidade em tempo real e reserve direto.',
    schema: () => [breadcrumbs([['Início', '/'], ['Alojamentos', '/alojamentos']])],
  },
  '/experiencias': {
    file: 'experiencias',
    title: 'Experiências em Lagos',
    description: 'Passeios de barco às grutas da Ponta da Piedade, kayak, surf, prova de vinhos e chef em casa. Junte experiências à sua estadia em Lagos.',
    schema: () => [breadcrumbs([['Início', '/'], ['Experiências', '/experiencias']])],
  },
  '/regiao': {
    file: 'regiao',
    title: 'Guia de Lagos: praias, restaurantes e roteiro',
    description: 'As melhores praias de Lagos, onde comer peixe grelhado, um roteiro de um dia e como chegar ao Algarve. Um guia feito por quem cá vive.',
    type: 'article',
    schema: () => [
      {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        name: 'Lagos, Algarve',
        description: 'Vila do Algarve com praias douradas, falésias e um centro histórico cheio de vida.',
        url: absolute('/regiao'),
        includesAttraction: ['Praia do Camilo', 'Praia Dona Ana', 'Ponta da Piedade', 'Meia Praia'].map((name) => ({ '@type': 'TouristAttraction', name })),
      },
      breadcrumbs([['Início', '/'], ['A região', '/regiao']]),
    ],
  },
  '/contactos': {
    file: 'contactos',
    title: 'Contactos',
    description: 'Fale com a Maré sobre reservas, grupos ou estadias longas em Lagos. Telefone, WhatsApp e email, com resposta em menos de 24 horas.',
    schema: () => [{ '@context': 'https://schema.org', '@type': 'ContactPage', url: absolute('/contactos'), about: { '@id': absolute('/#maré') } }, business()],
  },
  '/entrar': { file: 'entrar', title: 'Entrar', description: 'Entre na sua conta Maré para gerir reservas e fazer o check-in online.', noindex: true },
  '/conta': { file: 'conta', title: 'A minha conta', description: 'As suas reservas na Maré.', noindex: true },
  '/reserva': { file: 'reserva', title: 'Confirmar reserva', description: 'Confirme a sua reserva na Maré.', noindex: true },
  '/painel': { file: 'painel', title: 'Painel de gestão', description: 'Painel de gestão da Maré.', noindex: true },
};

export const GALLERY_WIDTHS = [480, 720, 960, 1280, 1600];

export function propertyPage(property) {
  const path = `/alojamentos/${property.slug}`;
  const prices = [property.pricePerNight, ...property.seasons.map((s) => s.price)];

  return {
    file: 'alojamento',
    path,
    title: `${property.name} — ${property.area}, Lagos`,
    description: `${property.tagline}. ${property.bedrooms} quartos, até ${property.guests} hóspedes, desde ${property.pricePerNight} € por noite. ${property.description}`.slice(0, 158).replace(/\s\S*$/, '…'),
    image: photoUrl(property.images[0], 1200, 0.525),
    preload: [{ srcset: srcset(property.images[0], GALLERY_WIDTHS, 0.72), sizes: '(max-width: 760px) 100vw, 50vw' }],
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'VacationRental',
        '@id': absolute(path),
        name: property.name,
        description: property.description,
        url: absolute(path),
        image: property.images.map((url) => photoUrl(url, 1200, 0.75)),
        address: { ...address, streetAddress: property.area },
        containsPlace: {
          '@type': 'Accommodation',
          additionalType: 'EntirePlace',
          numberOfBedrooms: property.bedrooms,
          numberOfBathroomsTotal: property.bathrooms,
          occupancy: { '@type': 'QuantitativeValue', maxValue: property.guests },
          floorSize: { '@type': 'QuantitativeValue', value: property.size, unitCode: 'MTK' },
          amenityFeature: property.amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
        },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: property.rating, reviewCount: property.reviews.length, bestRating: 5 },
        review: property.reviews.map((r) => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: r.author },
          datePublished: `${r.date}-01`,
          reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
          reviewBody: r.text,
        })),
        priceRange: `${Math.min(...prices)} € – ${Math.max(...prices)} € por noite`,
        checkinTime: '16:00',
        checkoutTime: '11:00',
        brand: { '@id': absolute('/#maré') },
      },
      breadcrumbs([['Início', '/'], ['Alojamentos', '/alojamentos'], [property.name, path]]),
    ],
  };
}
