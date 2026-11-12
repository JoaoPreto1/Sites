import { env } from '../config/env.js';

const SITE_NAME = 'Lente Studio';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=1200&h=630&q=80&fit=crop';

export const absolute = (path = '/') => `${env.siteUrl}${path}`;

const escape = (value = '') =>
  String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

// JSON-LD dentro de <script>: impede que um "</script>" nos dados feche a tag
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export function renderHead({ title, description, path = '/', image = DEFAULT_IMAGE, type = 'website', noindex = false, schema = [], preload = [] }) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · Fotografia e vídeo no Porto`;
  const url = absolute(path);

  const tags = [
    `<title>${escape(fullTitle)}</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta name="theme-color" content="#111111">',
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    '<meta property="og:locale" content="pt_PT">',
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:title" content="${escape(fullTitle)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${escape(image)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escape(fullTitle)}">`,
    `<meta name="twitter:description" content="${escape(description)}">`,
    `<meta name="twitter:image" content="${escape(image)}">`,
    ...preload.map(
      ({ srcset, sizes }) => `<link rel="preload" as="image" imagesrcset="${escape(srcset)}" imagesizes="${escape(sizes)}" fetchpriority="high">`,
    ),
    ...schema.filter(Boolean).map(jsonLd),
  ];

  return tags.join('\n  ');
}
