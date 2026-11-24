import { SITE } from '../config/platform.js';
import { absolute } from './head.js';

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: absolute('/'),
  inLanguage: 'pt-PT',
  description: SITE.tagline,
});

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: absolute('/'),
  logo: absolute('/icon-512.png'),
  areaServed: { '@type': 'Country', name: 'Portugal' },
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

// Página de um pedido: sem nome, sem localização exata, só o que já é público
export const adPage = (ad) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: ad.title,
  url: absolute(`/pedidos/${ad.slug}`),
  datePublished: ad.publishedAt,
  inLanguage: 'pt-PT',
  about: { '@type': 'Thing', name: ad.categoryLabel },
});

export const faq = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
